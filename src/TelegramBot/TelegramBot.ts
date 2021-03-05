import { Telegraf } from "telegraf";
import TaskManager from "../TaskManager";
import * as config from "config";
import { Commands } from "./Commands";
import { startupMessage } from "./types";

const token = config.get("bot.token");
const logChannel = config.get("bot.log_channel_id");

export default class TelegramBot {
  private instance: Telegraf;
  private commands: Commands;
  constructor(taskManager: TaskManager) {
    this.instance = new Telegraf(token);
    this.commands = new Commands(taskManager);

    this.setup();
  }

  private setup() {
    this.instance.command("status", this.commands.status);
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
