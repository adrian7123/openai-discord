import * as dotenv from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.login(process.env.TOKEN);

client.on("ready", () => {
  console.log("bot online");
});

const config = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(config);

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (process.env.CHANNELS?.includes(msg.channel.id)) return;
  if (msg.content.startsWith("!")) return;

  if (!msg.content || msg.attachments.mapValues.length <= 0) return;

  const conversationLog: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: "Repita a frase",
    },
  ];

  conversationLog.push({
    role: "user",
    content: msg.content,
  });

  await msg.channel.sendTyping();

  if (msg.content.startsWith("/img")) {
    console.log(`Message: ${msg.content}`);

    const result = await openai.createImage({
      prompt: msg.content.replace("/img", ""),
    });

    console.log(`Reply: ${result.data.data[0].url}`);

    try {
      msg.reply(result.data.data[0].url ?? "ChatGpt Image error: internal");
    } catch (e) {
      console.log(e);
    }
    return;
  }

  let log = `Message: ${msg.content}`;

  console.log(log);

  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: conversationLog,
  });

  console.log(result.data.choices);

  log = `Reply: ${result.data.choices[0].message?.content}`;

  console.log(log);

  try {
    msg.reply(result.data.choices[0].message ?? "ChatGpt Text error: internal");
  } catch (e) {
    console.log(e);
  }
});
