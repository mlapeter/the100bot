// const SequelizeProvider = require("./utils/sequelize");
// const Sequelize = require("sequelize");

const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");

const path = require("path");
require("dotenv").config();

const Api = require("./utils/api");
const api = new Api();
const DiscordApi = require("./utils/discordApi");
const discordApi = new DiscordApi();

const welcome = require("./events/welcome");
// const messageReactionAdd = require("./events/messageReactionAdd");
// const messageReactionRemove = require("./events/messageReactionRemove");
const handleWebhooks = require("./events/handleWebhooks");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

// if (process.env.THE100_API_BASE_URL != "http://localhost:3000/api/v2/") {
//   console.log("Connecting to database...");
//   const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   });

//   sequelize
//     .authenticate()
//     .then((response) => {
//       console.log("Database connected.");
//     })
//     .catch((e) => {
//       console.error("Unable to connect to the database:", e);
//     });

//   client.setProvider(new SequelizeProvider(sequelize));
// }

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("with The100.io!");
  handleWebhooks(client);
});

client.on("error", (error) => {
  console.log("Client Error");
  console.error("The WebSocket encountered an error:", error);
});

client.on("interactionCreate", async (interaction) => {
  // console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    // await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
});

client
  .login(process.env.DISCORD_BOT_TOKEN)
  .then()
  .catch((error) => {
    console.log("Login failed! ");
    console.log(error);
  });
