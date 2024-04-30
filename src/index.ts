import express from "express";

import services from "./services";
import cron from "./services/cron";

const app = express();
const PORT = 3040;

// Middleware
app.use(express.json());

// Configures services
services(app);

cron.start();
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
