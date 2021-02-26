import { Item, Summary } from "paapi5-typescript-sdk";
import { AmazonProduct } from "./entities/AmazonProduct";
import amazonProductRepository from "./repositories/AmazonProductRepository";
import { percentageDiff } from "./utils";
import * as config from "config";

const threshold = config.get("tracker.deal_threshold");

export default async function (job) {
  // console.log(`[${amazonRawItem.ASIN}] ${amazonRawItem.ItemInfo?.Title.DisplayValue}`);

  const amazonRawItem: Item = job.data;

  // Retreive item saved in the database
  const savedItem = await amazonProductRepository.findOne(amazonRawItem.ASIN);

  if (savedItem.iterations != 0) {
    let newPrice: number;
    let oldPrice: number;
    const summaries: Summary[] = amazonRawItem.Offers?.Summaries || [];
    summaries.forEach((summary) => {
      if (summary.Condition?.Value === "New") {
        compareNew(summary.LowestPrice.Amount, savedItem.price);
      } else if (summary.Condition?.Value === "Used") {
      }
    });
  }
}

function updateAmazonProduct(amazonRawItem: Item, isNew: boolean = true) {
  const amazonProduct = new AmazonProduct();
}

function compareNew(price: number, oldPrice: number) {}

function compareUsed() {}
