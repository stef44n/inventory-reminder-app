const cron = require("node-cron");
const { updateAllReminders } = require("../services/reminderService");

// Run every 15 minutes
const startScheduler = () => {
    cron.schedule("*/15 * * * *", async () => {
        console.log("Running reminder update...");
        await updateAllReminders();
    });
};

module.exports = startScheduler;
