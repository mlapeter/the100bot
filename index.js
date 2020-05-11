const { CommandoClient } = require("discord.js-commando");
const SequelizeProvider = require('./utils/sequelize')
const Sequelize = require('sequelize');
const path = require("path");
require('dotenv').config();


const client = new CommandoClient({
  commandPrefix: "!",
  owner: process.env.OWNER_DISCORD_ID,
  invite: "https://discord.gg/dBZRVB9",
  disableEveryone: true,
  unknownCommandResponse: false
});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
})

sequelize.authenticate().then((response) => {
  console.log('Database connected.');
}).catch((e) => {
  console.error('Unable to connect to the database:', e);
})

client.setProvider(new SequelizeProvider(sequelize));

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
  client.user.setActivity("with The100.io");
});
client.on('error', error => {
  console.log("Client Error");
  console.error('The WebSocket encountered an error:', error);
});

client.login(process.env.DISCORD_BOT_TOKEN);