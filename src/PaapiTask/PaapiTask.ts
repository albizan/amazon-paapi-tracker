import { SimpleIntervalJob, Task } from "toad-scheduler";
import { Queue } from "bullmq";
import * as dayjs from "dayjs";
import "dayjs/locale/it"; // import locale
import { chunk } from "../utils";
import Paapi from "../apis/amazon";
import { TaskStatus } from "./Status";

export default class PaapiTask {
  private chunks: string[][];
  private asinAmount: number;
  private index: number;
  private delay: number;
  private paapi: Paapi;
  private queue: Queue;
  private latestIteration: string;
  private latestRequestedAsin: string;
  private errorMessages: Set<string>;

  constructor(asins: string[], delay: number, paapi: Paapi, queue: Queue) {
    // I can send up to 10 asins in a request
    this.chunks = chunk(asins, 10);
    this.asinAmount = asins.length;
    this.index = 0;
    this.delay = delay;
    this.paapi = paapi;
    this.queue = queue;
    this.errorMessages = new Set();

    /* @TODO delete
    this.paapi.getItems(["B07VZR1WDT"]).then((result) => {
      result.ItemsResult.Items.forEach((x) => console.log(x.Offers.Listings));
    }); */
  }

  getJob(): SimpleIntervalJob {
    return new SimpleIntervalJob({ milliseconds: this.delay }, this.getTask());
  }

  getStatus(): TaskStatus {
    return {
      tag: this.paapi.getTag(),
      chunks: this.chunks.length,
      asinAmount: this.asinAmount,
      index: this.index,
      latestIteration: this.latestIteration,
      latestRequestedAsin: this.latestRequestedAsin,
    };
  }

  getErrors(): string[] {
    return Array.from(this.errorMessages).concat(this.paapi.getErrors());
  }

  private getTask(): Task {
    return new Task(
      this.paapi.getTag(),
      () => {
        // this.log(`Index: ${this.index} - ${this.chunks[this.index]}`);
        this.paapi.getItems(this.chunks[this.index]).then((data) => {
          if (data?.Errors) {
            data.Errors.forEach((paapiError) => this.errorMessages.add(paapiError.Message));
          }
          if (data?.ItemsResult) {
            const items = data.ItemsResult?.Items || [];
            items.forEach((item) => {
              this.queue.add(item.ASIN, item);
            });
            if (items[0]) {
              this.latestRequestedAsin = items[0].ASIN;
            }
          }
        });
        this.index = this.index === this.chunks.length - 1 ? 0 : this.index + 1;
        if (this.index === 0) {
          this.latestIteration = dayjs().locale("it").format("HH:mm:ss");
        }
      },
      (err: Error) => {
        this.error(err.message);
      }
    );
  }

  private error(message) {
    console.error(`[${dayjs().locale("it").format("HH:mm:ss")}] [PaapiTask] ${message}`);
  }
}
