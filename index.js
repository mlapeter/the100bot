// const sqlite = require('sqlite');
const { CommandoClient } = require("discord.js-commando");
const SequelizeProvider = require('./utils/sequelize')
const Sequelize = require('sequelize');

const path = require("path");
require('dotenv').config();


// const Api = require('./utils/api')

// const { Client } = require('pg');

// const client = new Client({
//   connectionString: process.env.DATABSE_URL,
//   ssl: true,
// });

// client.connect();

// console.log("CLIENT CONNECTED")

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log("row")
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });






const client = new CommandoClient({
  commandPrefix: "!",
  owner: process.env.OWNER_DISCORD_ID,
  invite: "https://discord.gg/dBZRVB9",
  disableEveryone: true,
  unknownCommandResponse: false
});

// sqlite.open(path.join(__dirname, "settings.sqlite3")).then((db) => {
//   client.setProvider(new SQLiteProvider(db));
// });

console.log("DB URL: ")
console.log(process.env.DATABASE_URL)

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // <<<<<<< YOU NEED THIS
    }
  },
  // port: 5432,
  // dialect: 'postgres',
  // native: true
}) // Example for postgres

sequelize.authenticate().then((response) => {
  console.log('Connection has been established successfully.');
  console.log(response)
}).catch((e) => {
  console.error('Unable to connect to the database:', e);
})





// client.setProvider(new SequelizeProvider(sequelize));


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

console.log("RUNNING")

client.login(process.env.DISCORD_BOT_TOKEN);