const Timer = require("easytimer");
const Discord = require("discord.js");
const client = new Discord.Client();
const musings = require("./musings");
const config = require("./config");
const express = require("express");
const callout = require("request");
const app = express();

const prodInterval = 1000 * 60 * 5;
const testingInterval = 5000;
const openWeatherURL =
  "http://api.openweathermap.org/data/2.5/forecast?id=6619279&APPID=" + config.openweather_key + "&units=metric";

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

let weatherTimer = new Timer();
let firstWeatherCall = true;
weatherTimer.start();
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
  if (msg.content === "weather") {
    if (weatherTimer.getTimeValues().minutes >= 10 || firstWeatherCall) {
      callout(openWeatherURL, function(error, response, body) {
        body = JSON.parse(body);
        const weatherResponse = body.list;
        let respString = "WEATHER OVER THE NEXT 24H:\n";
        weatherResponse
          .filter((e, i) => {
            if (i < 10) return i;
          })
          .map(e => {
            respString +=
              "It will be " + e.main.temp + "c at " + e.dt_txt + ". There will be " + e.weather[0].description + ".\n";
          });
        msg.reply(respString);
      });
      weatherTimer.stop();
      firstWeatherCall = false;
    } else if (weatherTimer.getTimeValues().minutes < 10) {
      msg.reply("We've exceeded our limit. Try again in " + (10 - weatherTimer.getTimeValues().minutes) + " minute/s.");
    }
  }
  if (msg.content === "kyle" && !started) {
    started = true;
    msg.reply(
      "\nCOMMANDS: \nstop:\tKyle will stop sending messages.\nkyle:\tKyle will start sending messages.\nweather:\tKyle will tell you tomorrow's forecast for Sydney."
    );
    timer = await client.setInterval(() => {
      msg.channel.send(randomMusing(concatMusings));
    }, prodInterval);
  }
});

client.login(config.token);
