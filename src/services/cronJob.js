import cron from "node-cron";
function cronJobs() {
  cron.schedule("*/5 * * * * *", () => {
    console.log("It's cron job running every 5 seconds");
  });
}

export default cronJobs;
