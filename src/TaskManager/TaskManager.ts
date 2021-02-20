// Get all paapi credentials and create as many scheduler as paapi credentials pairs
// Each scheduler might have a different timer based on each individual paapi delay value

import * as config from "config";
import { ToadScheduler } from "toad-scheduler";
import Task from "../Task";
import Paapi from "../Paapi";
import PaapiCredentials from "../PaapiCredentials";

export default class SchedulerManager {
  private paapiCredentialsAsList: PaapiCredentials[];
  private tasks: Task[];

  constructor() {
    this.paapiCredentialsAsList = config.get("paapi_credentials");
  }

  private balanceAsinsInTasks(rates: number[]): number[] {
    // Balance schedulers with appropiate number of asin, lower the delay faster the scheduler, faster schedulers receive more asins
    let sumOfRates = rates.reduce((acc, delay) => (acc += delay), 0);
    const schedulersWeights = rates.map((rateo) => rateo / sumOfRates);
    return schedulersWeights;
  }

  createTasks(asins: string[]) {
    const tempChunkedAsins: string[][] = [];
    let paapiRates = this.paapiCredentialsAsList.map(
      (credentials: PaapiCredentials) => 1000 / credentials.delay
    );
    let engineWeights: number[];

    // Chunk items to match engine weights
    while (asins.length > 0) {
      engineWeights = this.balanceAsinsInTasks(paapiRates);
      let stopIndex = Math.ceil(asins.length * engineWeights[0]);
      tempChunkedAsins.push(asins.slice(0, stopIndex));
      asins = asins.slice(stopIndex);
      paapiRates = paapiRates.slice(1);
    }

    const paapiScheduler = new ToadScheduler();
    this.tasks = tempChunkedAsins.map((asins, index) => {
      return new Task(
        asins,
        this.paapiCredentialsAsList[index].delay,
        new Paapi(this.paapiCredentialsAsList[index]),
        paapiScheduler
      );
    });
  }

  startTasks() {
    this.tasks.forEach((task) => {
      task.start();
    });
  }
}
