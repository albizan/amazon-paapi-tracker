import TelegramBot from "../TelegramBot";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import { Item, Summary } from "paapi5-typescript-sdk";
import { AmazonProduct } from "../entities/AmazonProduct";
import { percentageDiff } from "../utils";
import * as config from "config";
import { Worker } from "bullmq";
import { availableAgainMessage, discountMessage } from "../TelegramBot/MessageBuilder";
import * as dayjs from "dayjs";
import "dayjs/locale/it"; // import locale

const threshold = config.get("tracker.deal_threshold");

class WorkerManager {
  private worker: Worker;
  constructor(private bot: TelegramBot) {}

  start() {
    this.worker = new Worker("parse-asins", this.amazonComparison, {
      connection: {
        host: config.get("redis.host"),
        port: config.get("redis.port"),
        password: config.get("redis.password"),
      },
    });
  }

  amazonComparison = async (job) => {
    let isNewProduct = false;
    const amazonRawItem: Item = job.data;

    // Retreive item saved in the database
    const savedItem = await amazonProductRepository.findOne(amazonRawItem.ASIN);
    let price: number, warehousePrice: number;

    const listingPrice = amazonRawItem.Offers?.Listings[0].Price?.Amount;
    const seller = amazonRawItem.Offers?.Listings[0].MerchantInfo?.Name;
    const summaries: Summary[] = amazonRawItem.Offers?.Summaries || [];

    if (savedItem.iterations === 0) {
      isNewProduct = true;
    }

    if (listingPrice) {
      this.comparePrice(isNewProduct, savedItem, listingPrice, savedItem.price, "New", seller);
      price = listingPrice;
    }
    const usedSummary = summaries.find((summary) => summary.Condition?.Value === "Used");
    if (usedSummary) {
      this.comparePrice(isNewProduct, savedItem, usedSummary.LowestPrice.Amount, savedItem.warehousePrice, "Used");
      warehousePrice = usedSummary.LowestPrice.Amount;
    }

    /* summaries.forEach((summary) => {
          if (summary.Condition?.Value === "New") {
            console.log(`Prezzo: ${listingPrice} (${summary.LowestPrice.Amount}) -> Seller: ${seller}`);
            this.comparePrice(savedItem, summary.LowestPrice.Amount, savedItem.price, "New");
            price = summary.LowestPrice.Amount;
          } else if (summary.Condition?.Value === "Used") {
            this.comparePrice(savedItem, summary.LowestPrice.Amount, savedItem.warehousePrice, "Used");
            warehousePrice = summary.LowestPrice.Amount;
          }
        }); */

    this.updateAmazonProduct(amazonRawItem, savedItem, isNewProduct, price, warehousePrice);
  };

  updateAmazonProduct = (amazonRawItem: Item, savedItem: AmazonProduct, isNewProduct: boolean, price: number, warehousePrice: number) => {
    if (isNewProduct) {
      savedItem.title = amazonRawItem.ItemInfo?.Title?.DisplayValue;
      savedItem.url = amazonRawItem.DetailPageURL;
      savedItem.image = amazonRawItem.Images?.Primary?.Large.URL;
      console.log("New entry: " + savedItem.title);
    }
    savedItem.price = price;
    savedItem.warehousePrice = warehousePrice;
    savedItem.iterations++;
    savedItem.visitedAt = dayjs().locale("it").format("HH:mm:ss");
    amazonProductRepository.save(savedItem);
  };

  comparePrice = (isnewProduct: boolean, savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, sellerName?: string) => {
    if (isnewProduct) {
      return;
    }
    // Product is available again
    if (!oldPrice) {
      try {
        this.bot.sendMessage(availableAgainMessage(savedItem, price, condition, sellerName));
      } catch (error) {
        console.error("Impossibile inviare notifica telegram");
      }

      return;
    }
    // Price decreased
    if (price < oldPrice) {
      const diff = percentageDiff(price, oldPrice);
      if (diff > threshold) {
        try {
          this.bot.sendMessage(discountMessage(savedItem, price, oldPrice, condition, diff, sellerName));
        } catch (error) {
          console.error("Impossibile inviare notifica telegram");
        }
      }
    }
  };
}

export default WorkerManager;
