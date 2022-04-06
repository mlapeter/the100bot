// const { CommandoClient } = require("discord.js-commando");
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
  handleWebhooks(client);
});

client.on("error", (error) => {
  console.log("Client Error");
  console.error("The WebSocket encountered an error:", error);
});

// log everything received from client
client.on("messageCreate", async (message) => {
  console.log(`Message from ${message.author.tag}: ${message.content}`);
});

// client.on("interactionCreate", async (interaction) => {
// if (!interaction.isButton()) return;
// console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

// console.log("user joining game");
// const json = await api.postReaction({
//   action: "join_gaming_session",
//   msg: interaction.message,
//   user: interaction.user,
//   body: { gaming_session_id: interaction.customId },
// });
// console.log(json);
// const { notice, gaming_session } = json;

// const substrings = ["reserve", "waitlist", "You just joined"];
// if (substrings.some((v) => notice.includes(v))) {
//   // await interaction.deferUpdate();
//   console.log("CHECKING PERMISSIONS...");
//   // check if we have edit message permissions
//   if (!interaction.message.channel.permissionsFor(interaction.user).has("MANAGE_MESSAGES")) {
//     console.log("NO PERMISSIONS");
//     // return interaction.reply("You don't have permissions to edit messages.");
//   }

//   const receivedEmbed = interaction.message.embeds[0];
//   const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
//   console.log("ORIGINAL interaction.message: ");
//   console.log(interaction.message);
//   await interaction.update({ embeds: [exampleEmbed] });
//   console.log("UPDATED interaction.message: ");
//   console.log(interaction.user);
//   return;
// } else {
//   // await interaction.deferUpdate();
//   console.log("ERROR:");
//   console.log(notice);
//   console.log(interaction);
//   // await interaction.reply(notice);
//   await interaction.reply({ content: notice, ephemeral: true });

// await interaction.update({ content: "A button was clicked!", components: [] });
// }

// console.log("NOTICE:");
// console.log(notice);

// if (!notice || notice == "Gaming Session not found.") {
//   console.log("ERROR in messageReactionAdd");
//   return;
// }

// if (!gaming_session) {
//   // return interaction.user.send(json.notice);
//   await interaction.reply(notice);
// }

// console.log("GAMING SESSION:");
// console.log(gaming_session);

// console.log("CHECKING PERMISSIONS...");
// // check if we have edit message permissions
// if (!interaction.message.channel.permissionsFor(interaction.user).has("MANAGE_MESSAGES")) {
//   console.log("NO PERMISSIONS");
//   return interaction.reply("You don't have permissions to edit messages.");
// }

// const receivedEmbed = interaction.message.embeds[0];
// const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
// console.log("ORIGINAL interaction.message: ");
// console.log(interaction.message);
// await interaction.update({ embeds: [exampleEmbed] });
// console.log("UPDATED interaction.message: ");
// console.log(interaction.user);
// return;

// await interaction.reply(`${interaction.user} joined ${gaming_session.title}!`);
// });

// collector.on("end", (collected) => {
//   console.log(`Collected ${collected.size} interactions.`);
// });
// });

client.on("interactionCreate", async (interaction) => {
  // console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

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
