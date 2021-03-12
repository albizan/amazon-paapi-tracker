import { Telegraf } from "telegraf";
import TaskManager from "../TaskManager";
import * as config from "config";
import { Commands } from "./Commands";
import { setupMiddlewares } from "./Middleware";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import { amazonProductInfoMessage } from "../TelegramBot/MessageBuilder";

const token = process.env.BOT_TOKEN;
const logChannel = process.env.BOT_OUT_CHANNEL;

export default class TelegramBot {
  private instance: Telegraf;
  private commands: Commands;
  constructor(taskManager: TaskManager) {
    this.instance = new Telegraf(token);
    this.commands = new Commands(taskManager);

    this.setup();
  }

  private setup() {
    setupMiddlewares(this.instance);
    this.instance.command(["cmd", "command", "commands"], this.commands.listCommands);
    this.instance.command("stop", this.commands.stop);
    this.instance.command("restart", this.commands.restart);
    this.instance.command("status", this.commands.status);
    this.instance.command("errors", this.commands.errors);
    this.instance.command("add", this.commands.addAsins);
    this.instance.command("delete", this.commands.deleteAsins);
    this.instance.command("paapi", this.commands.paapi);

    // Parse asins sent in chat
    this.instance.on("text", async (ctx) => {
      if (ctx.message.text.length === 10 && ctx.message.text.toUpperCase().startsWith("B")) {
        const savedItem = await amazonProductRepository.findOne(ctx.message.text.toUpperCase());
        if (savedItem) {
          this.sendMessage(amazonProductInfoMessage(savedItem));
        }
      }
    });
  }

  launch() {
    this.instance.launch();
    // this.instance.telegram.sendMessage(logChannel, startupMessage);
  }

  sendMessage(msg: string) {
    this.instance.telegram.sendMessage(logChannel, msg, {
      parse_mode: "HTML",
    });
  }
}
