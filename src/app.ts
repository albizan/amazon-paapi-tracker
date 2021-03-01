import "reflect-metadata";
import { createConnection, ConnectionOptions } from "typeorm";
import WorkerManager from "./WorkerManager";
import amazonProductRepository from "./repositories/AmazonProductRepository";
import TaskManager from "./TaskManager";
import * as config from "config";
import TelegramBot from "./TelegramBot";

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

      const bot = new TelegramBot(taskManager);

      // Start background jobs on amazon products' queue
      const amazonProductAnalyzer = new WorkerManager(bot);
      amazonProductAnalyzer.start();

      bot.launch();
    } catch (error) {
      console.error(error);
    }
  }
}
