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
let errorLogs = "";
let commandTranscript = "";
client.on("message", async msg => {
  if (msg.content === "errorLogs") {
    msg.reply(errorLogs);
  }
  if (msg.content === "stop" && started) {
    commandTranscript += "{message: " + msg.content + ", id: 1}, ";
    started = false;
    msg.reply(randomMusing(stopMusings));
    timer = null;
    try {
      client.clearInterval(timer);
    } catch (e) {
      errorLogs += " -- " + e;
    }
  } else if (msg.content !== "kyle" && msg.content !== "stop" && msg.author.username !== "kylebot") {
    commandTranscript += "{message: " + msg.content + ", id: 2}, ";
    msg.reply(randomMusing(concatMusings));
  } else if (msg.content === "kyle" && !started) {
    commandTranscript += "{message: " + msg.content + ", id: 3}, ";
    started = true;
    try {
      client.clearInterval(timer);
    } catch (e) {
      errorLogs += " -- " + e;
    }
    timer = await client.setInterval(() => {
      msg.channel.send(randomMusing(concatMusings));
    }, Math.floor(Math.random() * prodInterval));
  }
});

client.login(process.env.TOKEN);
