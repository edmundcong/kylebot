const Discord = require("discord.js");
const client = new Discord.Client();
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
  } else if (msg.author.username !== "kylebot" && msg.content !== "kyle") {
    msg.reply(randomMusing(concatMusings));
  } else if (msg.content === "kyle" && !started && msg.author.username !== "kylebot") {
    started = true;
    try {
      client.clearInterval(timer);
    } catch (e) {}
    timer = client.setInterval(() => {
      msg.channel.send(randomMusing(concatMusings));
    }, Math.floor(Math.random() * testingInterval));
  }
});

client.login(process.env.TOKEN);
