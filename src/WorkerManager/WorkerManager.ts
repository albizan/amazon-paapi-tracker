import TelegramBot from "../TelegramBot";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import { Item, Summary } from "paapi5-typescript-sdk";
import { AmazonProduct } from "../entities/AmazonProduct";
import { percentageDiff } from "../utils";
import * as config from "config";
import { Worker } from "bullmq";
import { defaultMessage } from "../TelegramBot/MessageBuilder";
import * as dayjs from "dayjs";
import "dayjs/locale/it"; // import locale

const threshold = config.get("tracker.deal_threshold");

class WorkerManager {
  private worker: Worker;
  constructor(private bot: TelegramBot) {}

  start() {
    this.worker = new Worker("parse-asins", this.amazonComparison);
  }

  amazonComparison = async (job) => {
    let isNewProduct = false;
    const amazonRawItem: Item = job.data;
    /*
     * console.log(`[${amazonRawItem.ASIN}] ${amazonRawItem.Offers.Listings[0].Price.Amount}`);
     * console.log(amazonRawItem.DetailPageURL);
     * console.log(amazonRawItem.Offers?.Listings);
     * console.log("\n");
     *
     */

    // Retreive item saved in the database
    const savedItem = await amazonProductRepository.findOne(amazonRawItem.ASIN);
    let price, warehousePrice;

    // console.log(`${savedItem.asin}: ${savedItem.price} => ${price} `);
    if (savedItem.iterations != 0) {
      const summaries: Summary[] = amazonRawItem.Offers?.Summaries || [];
      summaries.forEach((summary) => {
        if (summary.Condition?.Value === "New") {
          this.comparePrice(savedItem, summary.LowestPrice.Amount, savedItem.price, "New");
          price = summary.LowestPrice.Amount;
        } else if (summary.Condition?.Value === "Used") {
          this.comparePrice(savedItem, summary.LowestPrice.Amount, savedItem.warehousePrice, "Used");
          warehousePrice = summary.LowestPrice.Amount;
        }
      });
    } else {
      isNewProduct = true;
    }
    this.updateAmazonProduct(amazonRawItem, savedItem, isNewProduct, price, warehousePrice);
  };

  updateAmazonProduct = (amazonRawItem: Item, savedItem: AmazonProduct, isNewProduct: boolean, price: number, warehousePrice: number) => {
    if (isNewProduct) {
      savedItem.title = amazonRawItem.ItemInfo?.Title?.DisplayValue;
      savedItem.url = amazonRawItem.DetailPageURL;
      savedItem.image = amazonRawItem.Images?.Primary?.Large.URL;
    }
    savedItem.price = price;
    savedItem.warehousePrice = warehousePrice;
    savedItem.iterations++;
    savedItem.visitedAt = dayjs().locale("it").format("HH:mm:ss");
    amazonProductRepository.save(savedItem);
  };

  comparePrice = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string) => {
    // console.log(`${oldPrice} => ${price}`);
    // Product is available again
    if (!oldPrice) {
      this.bot.sendMessage("Di nuovo disponibile\n\n" + defaultMessage(savedItem, price, oldPrice, condition));
      console.log("Di nuovo disponibile " + savedItem.asin);
      return;
    }
    if (price < oldPrice) {
      const diff = percentageDiff(price, oldPrice);
      if (diff > threshold) {
        this.bot.sendMessage("Possibile offerta\n\n" + defaultMessage(savedItem, price, oldPrice, condition, diff));
        console.log(`Ribasso ${savedItem.asin} ${condition}: ${diff} - ${oldPrice} => ${price}`);
      }
    }
  };
}

export default WorkerManager;
