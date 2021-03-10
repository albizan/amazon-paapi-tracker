import { Context } from "telegraf";

export default class StatefulContext extends Context {
  state: {
    command: {
      raw: string;
      cmd: string;
      args: string[];
    };
  };
}
