import { Telegraf } from "telegraf";

export function parseCommands(bot: Telegraf) {
  bot.use(parserMiddleware);
}

function parserMiddleware(ctx, next) {
  const entities: Array<TelegrafEntity> = ctx.update?.message?.entities;
  if (!entities) return next();

  const isCommand = entities.find((e) => e.type === "bot_command");
  if (!isCommand) return next();

  // I am sure there is a command in the field ctx.update.message.text
  const text = removeSpaces(ctx.update.message.text);
  const match = text.match(/^\/([^\s]+)\s?(.+)?/);
  let args = [];
  let command;
  if (match !== null) {
    if (match[1]) {
      command = match[1];
    }
    if (match[2]) {
      args = match[2].split(" ");
    }
  }
  ctx.state.command = {
    raw: text,
    cmd: command,
    args,
  };

  return next();
}

function removeSpaces(str: string) {
  return str.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
}

type TelegrafEntity = {
  offset: number;
  length: number;
  type: string;
};
