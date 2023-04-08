"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const discord_js_1 = require("discord.js");
const openai_1 = require("openai");
dotenv.config();
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
    ],
});
client.on("ready", () => {
    console.log("bot online");
});
const config = new openai_1.Configuration({
    apiKey: process.env.API_KEY,
});
const openai = new openai_1.OpenAIApi(config);
client.on("messageCreate", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (msg.author.bot)
        return;
    if (msg.channel.id !== process.env.CHANNEL_ID)
        return;
    if (msg.content.startsWith("!"))
        return;
    const conversationLog = [
        {
            role: "system",
            content: "i am bot",
        },
    ];
    conversationLog.push({
        role: "user",
        content: msg.content,
    });
    yield msg.channel.sendTyping();
    const result = yield openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: conversationLog,
    });
    msg.reply((_a = result.data.choices[0].message) !== null && _a !== void 0 ? _a : "ChatGpt error: internal");
}));
client.login(process.env.TOKEN);
