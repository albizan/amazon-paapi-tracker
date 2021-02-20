import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
import { chunk } from "../utils";
import Paapi from "../Paapi";

export default class PaapiTask {
  private chunks: string[];
  private index: number;
  private delay: number;
  private paapi: Paapi;
  private scheduler: ToadScheduler;

  constructor(
    asins: string[],
    delay: number,
    paapi: Paapi,
    scheduler: ToadScheduler
  ) {
    // I can send up to 10 asins in a request
    this.chunks = chunk(asins, 10);
    this.index = 0;
    this.delay = delay;
    this.paapi = paapi;
    this.scheduler = scheduler;
  }

  start() {
    const task = new Task("print chunks", () => {
      console.log(this.chunks[this.index]);
      this.index = this.index === this.chunks.length - 1 ? 0 : this.index++;
    });
    const job = new SimpleIntervalJob({ milliseconds: this.delay }, task);
    this.scheduler.addSimpleIntervalJob(job);
    console.log(`Task ${this.paapi.getTag()} started`);
  }
}
