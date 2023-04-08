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

client.on("ready", () => {
  console.log("bot online");
});

const config = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(config);

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== process.env.CHANNEL_ID) return;
  if (msg.content.startsWith("!")) return;

  const conversationLog: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: "Brasil!",
    },
  ];

  conversationLog.push({
    role: "user",
    content: msg.content,
  });

  await msg.channel.sendTyping();

  console.log(`Message: ${msg.content}`);

  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: conversationLog,
  });

  console.log(`Reply: ${result.data.choices[0].message?.content}`);

  try {
    msg.reply(result.data.choices[0].message ?? "ChatGpt error: internal");
  } catch (e) {
    console.log(e);
  }
});

client.login(process.env.TOKEN);
