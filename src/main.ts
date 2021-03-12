import * as dotenv from "dotenv";
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  dotenv.config();
}

import App from "./app";

const app = new App();

app.start();
