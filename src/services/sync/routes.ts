import { Express } from "express";
import { sync } from "./controller";

export default (app: Express) => {
  // Comme on est amener à créer / modifier / supprimer, j'ai préféré partie sur une route PUT
  app.put("/sync", sync);
};
