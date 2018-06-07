const Discord = require("discord.js");
const client = new Discord.Client();
const musings = require("./musings");
const express = require("express");
const app = express();

const prodInterval = 1000 * 60 * 5;
const testingInterval = 5000;

const randomMusing = items => {
  return items[Math.floor(Math.random() * items.length)];
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

app.set("port", process.env.PORT || 5000);

//For avoidong Heroku $PORT error
app
  .get("/", function(request, response) {
    const result = "App is running";
    response.send(result);
  })
  .listen(app.get("port"), function() {
    console.log("App is running, server is listening on port ", app.get("port"));
  });

const { stopMusings } = musings;
const { generalMusings } = musings;
const concatMusings = [...stopMusings, ...generalMusings];
let started = false;
let timer;
client.on("message", async msg => {
  if (msg.content === "stop" && started) {
    started = false;
    msg.reply(randomMusing(stopMusings));
    try {
      client.clearInterval(timer);
    } catch (e) {
      msg.reply("contact Ed I broke (err: 1)");
    }
    timer = null;
  }
  if (msg.content === "kyle" && !started) {
    started = true;
    msg.reply(
      "COMMANDS: \nstop: Kyle will stop sending messages.\nkyle: Kyle will start sending messages.\nweather: Kyle will tell you tomorrow's forecast for Sydney."
    );
    timer = await client.setInterval(() => {
      msg.channel.send(randomMusing(concatMusings));
    }, prodInterval);
  }
});

client.login(process.env.TOKEN);
