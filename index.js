const fs = require("node:fs");
const path = require("path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
} = require("discord.js");

require("dotenv").config();

const Api = require("./utils/api");
const api = new Api();
const DiscordApi = require("./utils/discordApi");
const discordApi = new DiscordApi();

// Function-style event modules (module.exports = (client) => {...}). These are
// wired explicitly below rather than through the events/ auto-loader, which
// only handles modules that export { name, execute }.
const welcome = require("./events/welcome");
const handleWebhooks = require("./events/handleWebhooks");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    // Required to read message.content of incoming the100.io webhook posts
    // (see events/handleWebhooks.js). Must also be enabled in the Discord
    // developer portal (Privileged Gateway Intents → Message Content).
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Auto-load { name, execute } style event modules from ./events.
const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  // Skip function-style / commented-out modules that don't export a name.
  if (!event || !event.name || typeof event.execute !== "function") continue;
  try {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  } catch (error) {
    console.log("EVENT ERROR: ");
    console.error(error);
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

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("with The100.io!");
  welcome(client);
  handleWebhooks(client);
});

client.on("error", (error) => {
  console.log("Client Error");
  console.error("The WebSocket encountered an error:", error);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`${interaction.user.tag} in #${interaction.channel?.name} triggered an interaction.`);

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
    const permissions = interaction.channel?.permissionsFor(client.user);
    client.users.cache
      .get(process.env.OWNER_DISCORD_ID)
      ?.send(
        `Error for command: **${interaction.commandName}** with proper permissions: **${permissions?.has(
          PermissionsBitField.Flags.ManageMessages
        )}** in channel ${interaction.channel} in guild ${interaction.guild?.name} - ${interaction.guild} from user ${
          interaction.user
        } - ${interaction.user?.id}`
      );

    client.users.cache.get(process.env.OWNER_DISCORD_ID)?.send(error.toString());

    await interaction.channel?.send(
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
