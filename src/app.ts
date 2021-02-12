import "reflect-metadata";
import { createConnection, ConnectionOptions } from "typeorm";
import * as config from "config";

const connectionOptions: ConnectionOptions = {
  type: "postgres",
  url: config.get("db_url"),
  synchronize: true,
  entities: [__dirname + "/entities/*{.ts,.js}"],
};

export default class App {
  async start() {
    try {
      await createConnection(connectionOptions);
      console.log("Connection established")
    } catch (error) {
      console.log("Error - can't connect to the database " + error);
    }
  }
}