import StatefulContext from "./StatefulContext";
import TaskManager from "../TaskManager";
import amazonProductRepository from "../repositories/AmazonProductRepository";

export class Commands {
  private taskManager: TaskManager;
  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  // Use arrow functions to bind "this"
  status = (ctx) => {
    const status = this.taskManager.getStatus();
    let msg = "";
    status.forEach((s) => {
      msg += `<b>Tag:</b> ${s.tag}\n<b>Avanzamento:</b> ${((100 * s.index) / s.chunks).toFixed(2)}%\n<b>Ultimo ASIN:</b> <code>${
        s.latestRequestedAsin
      }</code>\n<b>Fine ultima iterazione:</b> ${s.latestIteration || "N/A"}\n\n`;
    });
    ctx.replyWithHTML(msg);
  };

  errors = (ctx) => {
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

  addAsins = async (ctx) => {
    try {
      const args: string[] = ctx.state.command.args.filter((asin) => asin.toUpperCase().startsWith("B") && asin.length === 10);
      const promises = args.map((asin) => amazonProductRepository.addAsinToDB(asin));
      await Promise.all(promises);
      ctx.replyWithHTML("Ok");
    } catch (error) {
      ctx.replyWithHTML(error.message);
    }
  };
}
