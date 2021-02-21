import "reflect-metadata";
import { createConnection, ConnectionOptions } from "typeorm";
import { Worker } from "bullmq";
import amazonProductRepository from "./repositories/AmazonProductRepository";
import TaskManager from "./TaskManager";
import * as config from "config";
import { Item } from "paapi5-typescript-sdk";

const connectionOptions: ConnectionOptions = {
  type: "postgres",
  url: config.get("db_url"),
  synchronize: true,
  entities: [__dirname + "/entities/*{.ts,.js}"],
};

export default class App {
  async start() {
    try {
      // Connect to database
      await createConnection(connectionOptions);
      console.log("Connection to database established");

      // Fetch all asins
      const asins: string[] = await amazonProductRepository.getAsins();
      console.log(`Retreived ${asins.length} ASINs`);

      const taskManager = new TaskManager();
      taskManager.createTasks(asins);
      taskManager.startTasks();

      const worker = new Worker("parse-asins", async (job) => {
        const amazonRawItem: Item = job.data;
        console.log(amazonRawItem);
      });
      console.log("Worker online");
    } catch (error) {
      console.error("Error - can't connect to the database " + error);
    }
  }
}
