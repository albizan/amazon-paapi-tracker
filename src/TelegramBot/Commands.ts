import { Context } from "telegraf";
import TaskManager from "../TaskManager";

export class Commands {
  taskManager: TaskManager;
  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  // Use arrow functions to bind "this"
  status = (ctx: Context) => {
    const status = this.taskManager.getStatus();
    let msg = "";
    status.forEach((s) => {
      msg += `<b>Tag:</b> ${s.tag}\n<b>Avanzamento:</b> ${((100 * s.index) / s.chunks).toFixed(2)}%\n<b>Fine ultima iterazione:</b> ${
        s.latestIteration || "N/A"
      }\n\n`;
    });
    ctx.replyWithHTML(msg);
  };
}
