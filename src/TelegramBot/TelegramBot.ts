import { Markup, Telegraf } from "telegraf";
import TaskManager from "../TaskManager";
import { Commands } from "./Commands";
import { setupMiddlewares } from "./Middleware";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import offerNotificationRepository from "../repositories/OfferNotificationRepository";
import { amazonProductInfoMessage, channelNotification } from "../TelegramBot/MessageBuilder";

const token = process.env.BOT_TOKEN;
const logChannel = process.env.BOT_OUT_CHANNEL;
const offerChannel = process.env.OFFER_CHANNEL;

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

    this.instance.on("callback_query", async (ctx: any) => {
      // Using context shortcut
      ctx.answerCbQuery();
      if (ctx.callbackQuery.data == "Approva") {
        const messageId = ctx.callbackQuery.message.message_id;
        const offer = await offerNotificationRepository.findOne(messageId);
        // console.log(notification);
        this.instance.telegram.sendMessage(offerChannel, channelNotification(offer.product, offer.price, offer.sellerName, offer.type), {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[Markup.button.url("Apri Amazon", offer.product.url)]],
          },
        });
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

  getInstance(): Telegraf {
    return this.instance;
  }
}
