import { Context } from "telegraf";
import TaskManager from "../TaskManager";

export class Commands {
  private taskManager: TaskManager;
  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  // Use arrow functions to bind "this"
  status = (ctx: Context) => {
    const status = this.taskManager.getStatus();
    let msg = "";
    status.forEach((s) => {
      msg += `<b>Tag:</b> ${s.tag}\n<b>Avanzamento:</b> ${((100 * s.index) / s.chunks).toFixed(2)}%\n<b>Ultimo ASIN:</b> <code>${
        s.latestRequestedAsin
      }</code>\n<b>Fine ultima iterazione:</b> ${s.latestIteration || "N/A"}\n\n`;
    });
    ctx.replyWithHTML(msg);
  };

  errors = (ctx: Context) => {
    const errors = this.taskManager.getErrors();
    let msg = "";
    errors.forEach((errorsArray) => {
      if (errorsArray.length > 0) {
        msg = msg + errorsArray.join(",");
      }
    });
    if (msg.length > 0) {
      ctx.replyWithHTML(msg);
    } else ctx.reply("Nessun errore riscontrato");
  };
}
