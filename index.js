// const { CommandoClient } = require("discord.js-commando");
// const SequelizeProvider = require("./utils/sequelize");
// const Sequelize = require("sequelize");

const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");

const path = require("path");
require("dotenv").config();

// const welcome = require("./events/welcome");
const messageReactionAdd = require("./events/messageReactionAdd");
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

// Commando JS
// const client = new CommandoClient({
//   commandPrefix: "!",
//   owner: process.env.OWNER_DISCORD_ID,
//   invite: "https://discord.gg/dBZRVB9",
//   disableEveryone: true,
//   unknownCommandResponse: false,
//   partials: ["MESSAGE", "CHANNEL", "REACTION"],
// });

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

// Commando JS
// client.registry
//   .registerDefaultTypes()
//   .registerGroups([
//     ["general", "General Commands"],
//     ["group", "Group Commands"],
//     ["gamingsession", "Gaming Session Commands"],
//   ])
//   .registerDefaultGroups()
//   // .registerDefaultCommands()
//   .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("with The100.io!");
  // welcome(client);
  // messageReactionAdd(client);
  // messageReactionRemove(client);
  // handleWebhooks(client);
});

client.on("error", (error) => {
  console.log("Client Error");
  console.error("The WebSocket encountered an error:", error);
});

// log everything received from client
client.on("messageCreate", async (message) => {
  console.log(`Message from ${message.author.tag}: ${message.content}`);
});

client.on("interactionCreate", async (interaction) => {
  console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("select")
        .setPlaceholder("Nothing selected")
        .addOptions([
          {
            label: "Select me",
            description: "This is a description",
            value: "first_option",
          },
          {
            label: "You can select me too",
            description: "This is also a description",
            value: "second_option",
          },
        ])
    );

    await interaction.reply({ content: "Pong!", components: [row] });
  }

  const { commandName } = interaction;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    // await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
// .then()
// .catch((error) => {
//   console.log("Login failed! ");
//   console.log(error);
// });
