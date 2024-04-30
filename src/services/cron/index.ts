import { CronJob } from "cron";
import { syncGoogleEvents } from "../sync/controller";

const syncEvent = new CronJob("*/2 * * * *", async () => {
  console.log("---- syncEvent ----");
  await syncGoogleEvents();
});

export default syncEvent;
// syncEvent.start();
