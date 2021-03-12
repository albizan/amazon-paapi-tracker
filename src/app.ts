import "reflect-metadata";
import { createConnection, ConnectionOptions } from "typeorm";
import WorkerManager from "./WorkerManager";
import TaskManager from "./TaskManager";
import TelegramBot from "./TelegramBot";

const connectionOptions: ConnectionOptions = {
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true,
  entities: [__dirname + "/entities/*{.ts,.js}"],
};

export default class App {
  async start() {
    try {
      // Connect to database
      await createConnection(connectionOptions);
      console.log("Connection to database established");

      const taskManager = new TaskManager();
      await taskManager.createTasks();
      taskManager.startTasks();

      const bot = new TelegramBot(taskManager);

      // Start background jobs on amazon products' queue
      const amazonProductAnalyzer = new WorkerManager(bot);
      amazonProductAnalyzer.start();

      bot.launch();

      console.log("Running...");
    } catch (error) {
      console.error(error);
    }
  }
}
