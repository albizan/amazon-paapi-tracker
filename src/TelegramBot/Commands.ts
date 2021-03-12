import TaskManager from "../TaskManager";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import { Context } from "telegraf";
import Paapi from "../apis/amazon";
import * as config from "config";
import PaapiCredentials from "../PaapiCredentials";

export class Commands {
  private taskManager: TaskManager;
  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  // Use arrow functions to bind "this"

  listCommands = (ctx) => {
    ctx.replyWithHTML(
      "<pre><code>&#8226; cmd: mostra i comandi\n&#8226; stop: stoppa lo scheduler e i task\n&#8226; status: ottieni stato dei task\n&#8226; errors: mostra gli errori dei task\n&#8226; add: aggiungi uno o piu asin\n&#8226; delete: rimuovi uno o piu asin\n&#8226; paapi: interroga DB Amazon\n</code></pre>"
    );
  };

  stop = async (ctx) => {
    try {
      this.taskManager.stopTasks();
      ctx.reply(`Scheduler azzerato, task stoppati correttamente`);
    } catch (error) {
      ctx.reply(error.message);
    }
  };

  restart = async (ctx) => {
    try {
      this.taskManager.stopTasks();
      const asinAmount = await this.taskManager.createTasks();
      this.taskManager.startTasks();

      ctx.reply(`Task rigenerati corretamente, ${asinAmount} asin caricati`);
    } catch (error) {
      ctx.reply(error.message);
    }
  };

  status = (ctx) => {
    try {
      const status = this.taskManager.getStatus();
      let msg = "";
      status.forEach((s) => {
        msg += `<b>Tag:</b> ${s.tag}\n<b>Asin:</b> ${s.asinAmount}\n<b>Avanzamento:</b> ${((100 * s.index) / s.chunks).toFixed(
          2
        )}%\n<b>Ultimo ASIN:</b> <code>${s.latestRequestedAsin}</code>\n<b>Fine ultima iterazione:</b> ${s.latestIteration || "N/A"}\n\n`;
      });
      ctx.replyWithHTML(msg);
    } catch (error) {
      ctx.reply(error.message);
    }
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

  deleteAsins = async (ctx) => {
    try {
      const asins: string[] = ctx.state.command.args.filter((asin) => asin.toUpperCase().startsWith("B") && asin.length === 10);
      if (asins.length > 0) {
        await amazonProductRepository.deleteAsins(asins);
        ctx.replyWithHTML("Ok");
      } else {
        ctx.reply("Nessun ASIN trovato");
      }
    } catch (error) {
      ctx.replyWithHTML(error.message);
    }
  };

  paapi = async (ctx: Context) => {
    const paapiCredentials: PaapiCredentials = config.get("paapi_credentials")[0];
    const paapiTest = new Paapi(paapiCredentials);
    const args: string[] = ctx.state.command.args.filter((asin) => asin.toUpperCase().startsWith("B") && asin.length === 10);
    if (args.length > 0) {
      // Get only first Asin
      const asin = args[0];
      const result = await paapiTest.getItems([asin]);

      let summaryPrice, summaryWarehousePrice, listingPrice, seller;

      if (result?.ItemsResult?.Items[0]?.Offers?.Listings[0]) {
        // there is a listing
        listingPrice = result.ItemsResult.Items[0].Offers.Listings[0].Price?.Amount + "€";
        seller = result.ItemsResult.Items[0].Offers.Listings[0].MerchantInfo.Name;
      }

      if (result.ItemsResult.Items[0].Offers?.Summaries) {
        result.ItemsResult.Items[0].Offers?.Summaries.forEach((summary) => {
          if (summary.Condition?.Value === "New") {
            summaryPrice = summary.LowestPrice.Amount + "€";
          } else if (summary.Condition?.Value === "Used") {
            summaryWarehousePrice = summary.LowestPrice.Amount + "€";
          }
        });
      }

      ctx.replyWithHTML(
        `<b>${result.ItemsResult?.Items[0]?.ItemInfo?.Title?.DisplayValue || "N/A"}</b>
        \nListing:\nPrezzo (Nuovo): <i>${listingPrice || "N/A"}</i>\nSeller: ${seller || "N/A"}
        \nSummaries:\nPrezzo (Nuovo): <i>${summaryPrice || "N/A"}</i>\nPrezzo (Usato): <i>${summaryWarehousePrice || "N/A"}</i>
        \n<a href="${result.ItemsResult?.Items[0]?.DetailPageURL}">Vedi su amazon</a>`
      );
    } else {
      ctx.reply("Nessun asin trovato");
    }
  };
}
