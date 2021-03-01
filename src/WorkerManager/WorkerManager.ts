import TelegramBot from "../TelegramBot";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import { Item, Summary } from "paapi5-typescript-sdk";
import { AmazonProduct } from "../entities/AmazonProduct";
import { percentageDiff } from "../utils";
import * as config from "config";
import { Worker } from "bullmq";

const threshold = config.get("tracker.deal_threshold");

class WorkerManager {
  private worker: Worker;
  constructor(private bot: TelegramBot) {}

  start() {
    this.worker = new Worker("parse-asins", this.amazonComparison);
  }

  private async amazonComparison(job) {
    let isNewProduct = false;
    const amazonRawItem: Item = job.data;
    // console.log(`[${amazonRawItem.ASIN}] ${amazonRawItem.ItemInfo?.Title.DisplayValue}`);

    // Retreive item saved in the database
    const savedItem = await amazonProductRepository.findOne(amazonRawItem.ASIN);
    let price, warehousePrice;

    if (savedItem.iterations != 0) {
      const summaries: Summary[] = amazonRawItem.Offers?.Summaries || [];
      summaries.forEach((summary) => {
        if (summary.Condition?.Value === "New") {
          this.comparePrice(summary.LowestPrice.Amount, savedItem.price, "New");
          price = summary.LowestPrice.Amount;
        } else if (summary.Condition?.Value === "Used") {
          this.comparePrice(summary.LowestPrice.Amount, savedItem.warehousePrice, "Used");
          warehousePrice = summary.LowestPrice.Amount;
        }
      });
    } else {
      isNewProduct = true;
    }
    this.updateAmazonProduct(amazonRawItem, savedItem, isNewProduct, price, warehousePrice);
  }

  private updateAmazonProduct(amazonRawItem: Item, savedItem: AmazonProduct, isNewProduct: boolean, price: number, warehousePrice: number) {
    if (isNewProduct) {
      savedItem.title = amazonRawItem.ItemInfo?.Title?.DisplayValue;
    }
    savedItem.price = price;
    savedItem.warehousePrice = warehousePrice;
    savedItem.iterations++;

    amazonProductRepository.save(savedItem);
  }

  private comparePrice(price: number, oldPrice: number, condition: string) {
    // Product is available again
    if (!oldPrice) {
      // Send notification -> available again
      return;
    }
    if (price < oldPrice) {
      const diff = percentageDiff(price, oldPrice);
      if (diff > threshold) {
        // Send message with condition
      }
      console.log(`Ribasso ${condition}: ${diff} - ${oldPrice} => ${price}`);
    }
  }
}

export default WorkerManager;
