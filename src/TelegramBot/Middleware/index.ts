import { Telegraf } from "telegraf";

import { parseCommands } from "./CommandParser";

export function setupMiddlewares(bot: Telegraf) {
  parseCommands(bot);
}
