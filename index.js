const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config");
const musings = require("./musings");

const prodInterval = 1000 * 60 * 60;
const testingInterval = 5000;

const randomMusing = items => {
  return items[Math.floor(Math.random() * items.length)];
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const { stopMusings } = musings;
const { generalMusings } = musings;
const concatMusings = [...stopMusings, ...generalMusings];
let started = false;
let timer;
client.on("message", msg => {
  if (msg.content === "stop") {
    started = false;
    msg.reply(randomMusing(stopMusings));
    try {
      client.clearInterval(timer);
    } catch (e) {}
  } else if (msg.author.username !== "kylebot") {
    msg.reply(randomMusing(concatMusings));
  }
  if (msg.content === "kyle" && !started) {
    started = true;
    timer = client.setInterval(() => {
      msg.channel.send(randomMusing(concatMusings));
    }, Math.floor(Math.random() * prodInterval));
  }
});

client.login(process.env.TOKEN);
