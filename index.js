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
  try {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  } catch (error) {
    console.log("EVENT ERROR: ");
    console.error(error);
    sendError(error, interaction);
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
  console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    console.log("ABOUT TO EXECUTE COMMAND --------------------------------------------------");
    await command.execute(interaction);
  } catch (error) {
    console.log("interactionCreate in index.js ERROR: ");
    console.error(error);
    if (error && interaction) {
      sendError(error, interaction);
    }
  }
});

const sendError = async (error, interaction) => {
  try {
    console.log("START SEND ERROR");
    console.error(error);
    console.log(interaction);
    const permissions = interaction.channel?.permissionsFor(client.user);
    client.users.cache
      .get(process.env.OWNER_DISCORD_ID)
      .send(
        `Error for command: **${interaction.commandName}** with proper permissions: **${permissions?.has(
          "MANAGE_MESSAGES"
        )}** in channel ${interaction.channel} in guild ${interaction.guild?.name} - ${interaction.guild} from user ${
          interaction.user
        } - ${interaction.user?.id}`
      );

    client.users.cache.get(process.env.OWNER_DISCORD_ID).send(error.toString());

    await interaction.channel.send(
      "There was an error while executing this command - the developers have been notified and you can also contact us in our support discord: https://discord.gg/EFRQxvUGM6"
    );
  } catch (e) {
    console.log("sendError ERROR: ");
    console.log(e);
  }
};

client
  .login(process.env.DISCORD_BOT_TOKEN)
  .then()
  .catch((error) => {
    console.log("Login failed! ");
    console.log(error);
  });
