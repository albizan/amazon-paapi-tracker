import TelegramBot from "../TelegramBot";
import amazonProductRepository from "../repositories/AmazonProductRepository";
import { Item, Summary } from "paapi5-typescript-sdk";
import { AmazonProduct } from "../entities/AmazonProduct";
import { percentageDiff } from "../utils";
import { Worker } from "bullmq";
import { availableAgainMessage, discountMessage } from "../TelegramBot/MessageBuilder";
import * as dayjs from "dayjs";
import "dayjs/locale/it"; // import locale

const threshold = parseInt(process.env.DEFAULT_THRESHOLD);

class WorkerManager {
  private worker: Worker;
  private threshold = parseInt(process.env.DEFAULT_THRESHOLD);

  constructor(private bot: TelegramBot) {}

  start() {
    this.worker = new Worker("parse-asins", this.amazonComparison, {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    });
  }

  amazonComparison = async (job) => {
    // Some products may be added recently and they have no data to compare, handle them in a different manner with a isNewProduct flag
    let isNewProduct: boolean;
    let price: number, warehousePrice: number;

    // Get data from job queue, this is the data that amazon sends back from its private paapi
    const amazonRawItem: Item = job.data;

    // Retreive item saved in the database, this data needs to be compared to the data from the job queue (amazonRawItem)
    const savedItem = await amazonProductRepository.findOne(amazonRawItem.ASIN);

    // Get listing price, this price represents the price of the first item listed on amazon webpage, this can be null if there are no items available
    const listingPrice = amazonRawItem.Offers?.Listings[0].Price?.Amount;

    // Get seller's name, this can be null if there are no items available
    const seller = amazonRawItem.Offers?.Listings[0].MerchantInfo?.Name;

    // Get used summary object
    const usedSummary: Summary = amazonRawItem.Offers?.Summaries.find((summary) => summary.Condition?.Value === "Used");

    // If number of iterations is zero, item is in his first visit, handle differently with a flag
    isNewProduct = savedItem.iterations === 0 ? true : false;

    // If listingPrice is defined, compare with latest price of NEW
    if (listingPrice) {
      const isNotified = this.comparePrice(isNewProduct, savedItem, listingPrice, savedItem.price, "New", seller, savedItem.lastNotifiedNew);
      if (isNotified) {
        savedItem.lastNotifiedNew = Date.now();
      }
      price = listingPrice;
    }

    if (usedSummary) {
      const isNotified = this.comparePrice(isNewProduct, savedItem, usedSummary.LowestPrice.Amount, savedItem.warehousePrice, "Used", "N/A", savedItem.lastNotifiedWarehouse);
      if (isNotified) {
        savedItem.lastNotifiedWarehouse = Date.now();
      }
      warehousePrice = usedSummary.LowestPrice.Amount;
    }

    this.updateAmazonProduct(amazonRawItem, savedItem, isNewProduct, price, warehousePrice);
  };

  updateAmazonProduct = (amazonRawItem: Item, savedItem: AmazonProduct, isNewProduct: boolean, price: number = null, warehousePrice: number = null) => {
    if (isNewProduct) {
      savedItem.title = amazonRawItem.ItemInfo?.Title?.DisplayValue;
      savedItem.url = amazonRawItem.DetailPageURL;
      savedItem.image = amazonRawItem.Images?.Primary?.Large.URL;
    }
    savedItem.price = price;
    savedItem.warehousePrice = warehousePrice;
    savedItem.iterations++;
    savedItem.visitedAt = dayjs().add(2, "hour").locale("it").format("HH:mm:ss");
    amazonProductRepository.save(savedItem);
  };

  comparePrice = (isnewProduct: boolean, savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, sellerName: string, timestamp: number = 0): boolean => {
    const millisDelay = parseInt(process.env.NOTIFICATION_DELAY) || 3600000; // default is 1 hour = 3600000 millis
    let isNotified: boolean = false;

    // If product is newly added to db, do not compare
    // If product has been already notified minutes ago, ignore
    if (isnewProduct || Date.now() - timestamp < millisDelay) {
      return;
    }

    // Product is available again
    if (!oldPrice) {
      try {
        this.bot.sendMessage(availableAgainMessage(savedItem, price, condition, sellerName));
        isNotified = true;
      } catch (error) {
        console.error("Impossibile inviare notifica telegram, 'nuovamente disponibile'");
      }

      return isNotified;
    }
    // Price decreased
    if (price < oldPrice) {
      const diff = percentageDiff(price, oldPrice);
      if (diff > threshold) {
        try {
          this.bot.sendMessage(discountMessage(savedItem, price, oldPrice, condition, diff, sellerName));
          isNotified = true;
        } catch (error) {
          console.error("Impossibile inviare notifica telegram, 'prezzo piu basso'");
        }
      }
    }

    return isNotified;
  };
}

export default WorkerManager;
