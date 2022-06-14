const express = require("express");
const mongoose = require("mongoose");
const { Message, Person } = require("./models");
require("dotenv").config();

const port = process.env.PORT || "3001";
const webApp = express();
mongoose.connect(process.env.MONGO_URI);
webApp.use(express.json()); // for parsing application/json

// TODO: Extract stuff to routes.js and controllers once things get too unwieldy
webApp.get("/", (req, res) => {
  res.send("Hello World!");
});

// TODO: Allow sorting by recency
webApp.get("/people", async (req, res) => {
  const people = await Person.find({}, null, { limit: 10 }).exec();
  res.send(people);
});

// TODO: Allow sorting by recency
webApp.get("/messages", async (req, res) => {
  const messages = await Message.find({}, null, { limit: 10 }).exec();
  res.send(messages);
});

webApp.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
