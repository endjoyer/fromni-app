const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Campaign = require("../models/campaign");

const app = express();

app.use(bodyParser.json());

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
    maxAge: 60,
  })
);

mongoose.connect("mongodb://localhost/fromni", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post("/campaigns", async (req, res) => {
  const campaign = new Campaign(req.body);
  await campaign.save();
  res.send(campaign);
});

app.get("/campaigns", async (req, res) => {
  const campaigns = await Campaign.find();
  res.send(campaigns);
});

app.put("/campaigns/:id", async (req, res) => {
  const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send(campaign);
});

app.delete("/campaigns/:id", async (req, res) => {
  await Campaign.findByIdAndDelete(req.params.id);
  res.send({ message: "Campaign deleted" });
});

module.exports = app;
