const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth/authRoutes");
const testRoutes = require("./routes/testRoutes");
const consumableRoutes = require("./routes/consumableRoutes");
const chargeableRoutes = require("./routes/chargeableRoutes");
const expiryRoutes = require("./routes/expiryRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/consumables", consumableRoutes);
app.use("/api/chargeables", chargeableRoutes);
app.use("/api/expiry", expiryRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("Inventory Reminder API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
