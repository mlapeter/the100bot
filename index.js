const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("Ready!");
});

client.on("message", message => {
  if (message.content === "!ping") {
    message.channel.send("Pong from discordjs!");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
