const express = require("express");
const mongoose = require("mongoose");
const { Message } = require("./models");
require("dotenv").config();

const port = process.env.PORT || "3001";
const webApp = express();
mongoose.connect(process.env.MONGO_URI);

webApp.get("/", (req, res) => {
  res.send("Hello World!");
});

webApp.get("/messages", async (req, res) => {
  const messages = await Message.find({}, null, { limit: 10 }).exec();
  res.send(messages);
});

webApp.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
