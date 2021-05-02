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
      console.log("Connecting to database...");
      await createConnection(connectionOptions);
      console.log("Connection to database established");

      // Create taskmanager and all related tasks
      console.log("Creating task manager...");
      const taskManager = new TaskManager();
      await taskManager.createTasks();
      taskManager.startTasks();
      console.log("Task manager created, all tasks started");

      console.log("Creating Telegram BOT...");
      const bot = new TelegramBot(taskManager);
      console.log("Telegram BOT created");

      // Start background jobs on amazon products' queue
      console.log("Creating job worker...");
      const amazonProductAnalyzer = new WorkerManager(bot);
      amazonProductAnalyzer.start();
      console.log("Job worker created and started");

      bot.launch();
      console.log("\nAll systems running...");
    } catch (error) {
      console.error(error.message);
    }
  }
}
