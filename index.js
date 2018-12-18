const { CommandoClient } = require("discord.js-commando");
const path = require("path");
require('dotenv').config();

const client = new CommandoClient({
  commandPrefix: "!",
  owner: process.env.OWNER_DISCORD_ID,
  invite: "https://discord.gg/dBZRVB9",
  disableEveryone: true,
  unknownCommandResponse: false
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["general", "General Commands"],
    ["group", "Group Commands"],
    ["gamingsession", "Gaming Session Commands"]
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("with Commando");
});
client.on("error", console.error);
client.login(process.env.DISCORD_BOT_TOKEN);
