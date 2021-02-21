import { SimpleIntervalJob, Task } from "toad-scheduler";
import { Queue } from "bullmq";
import { format } from "date-fns";
import italianLocale from "date-fns/locale/it";
import { chunk } from "../utils";
import Paapi from "../Paapi";

export default class PaapiTask {
  private chunks: string[][];
  private index: number;
  private delay: number;
  private paapi: Paapi;
  private queue: Queue;

  constructor(asins: string[], delay: number, paapi: Paapi, queue: Queue) {
    // I can send up to 10 asins in a request
    this.chunks = chunk(asins, 10);
    this.index = 0;
    this.delay = delay;
    this.paapi = paapi;
    this.queue = queue;
  }

  getTask(): Task {
    return new Task(
      "print chunks",
      () => {
        this.log(`Index: ${this.index} - ${this.chunks[this.index]}`);
        this.paapi.getItems(this.chunks[this.index]).then((data) => {
          if (data) {
            const items = data.ItemsResult?.Items || [];
            items.forEach((item) => {
              this.queue.add(item.ASIN, item);
            });
          }
        });
        this.index = this.index === this.chunks.length - 1 ? 0 : this.index + 1;
      },
      (err: Error) => {
        this.error(err.message);
      }
    );
  }

  getJob(): SimpleIntervalJob {
    return new SimpleIntervalJob({ milliseconds: this.delay }, this.getTask());
  }

  private log(message) {
    console.log(`[${format(new Date(), "HH:mm:ss - dd MMMM yyyy", { locale: italianLocale })}] [PaapiTask] ${message}`);
  }

  private error(message) {
    console.error(
      `[${format(new Date(), "HH:mm:ss - dd MMMM yyyy", { locale: italianLocale })}] [PaapiTask] ${message}`
    );
  }
}
