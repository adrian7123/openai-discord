import * as dotenv from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
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
  if (!process.env.CHANNELS?.includes(msg.channel.id)) return;
  if (msg.content.startsWith("!")) return;
  if (msg.content.includes("@")) return;

  const { guild } = msg;

  if (!msg.content || msg.attachments.mapValues.length <= 0) return;

  const conversationLog: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `Duotalk é uma plataforma de atendimento omnichannel que auxilia negócios na geração de Leads e atendimento ao cliente.
      Somos uma plataforma de atendimento e vendas omnichannel para pequenas e médias empresas transformarem seu atendimento digital em vendas reais.
      
      Podemos te ajudar com:
      
      Unificar seu atendimento via Whatsapp, Instagram, Facebook e Webchat
      
      Organizar sua gestão de leads e vendas
      
      Chatbots para pré-atendimento em todos seus canais de venda
      
      Pesquisa de Satisfação pós-atendimento`,
    },
    {
      role: "system",
      content: "Você é um bot no meu discord.",
    },
    {
      role: "system",
      content: `Você esta no ${guild?.name} um servidor de discord para jogadores de CS:GO, Valorant e outros. Seu intuito é ensinar e melhorar a experiencia dos membros desse discord.`,
    },
    {
      role: "system",
      content: `O nome desse servidor é ${guild?.name}.`,
    },
  ];

  const discordHistoric = await msg.channel.messages.fetch({ limit: 30 });

  discordHistoric.forEach((dh) => {
    conversationLog.push({
      role: dh.author.id === "1094316334675927063" ? "assistant" : "user",
      content: dh.content,
    });
  });

  conversationLog.push({
    role: "user",
    name: msg.author.username,
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
    model: process.env.MODEL ?? "gpt-3.5-turbo",
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
