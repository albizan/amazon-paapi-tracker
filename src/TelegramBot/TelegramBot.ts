import { Telegraf } from "telegraf";
import TaskManager from "../TaskManager";
import * as config from "config";

const token = config.get("bot.token");
const logChannel = config.get("bot.log_channel_id");

export default class TelegramBot {
  private instance: Telegraf;
  constructor(private taskManager: TaskManager) {
    this.instance = new Telegraf(token);
  }

  launch() {
    this.instance.launch();
    this.instance.telegram.sendMessage(logChannel, `Bot avviato`);
  }
}
