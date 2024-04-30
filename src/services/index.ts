import { Express } from "express";

import events from "./events/routes";
import users from "./users/routes";
import sync from "./sync/routes";

export default (app: Express) => {
  events(app);
  users(app);
  sync(app);
};
