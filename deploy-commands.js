const path = require("path");
require("dotenv").config();

const fs = require("node:fs");

const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// const commands = [
//   new SlashCommandBuilder().setName("ping").setDescription("Replies with pong!"),
//   new SlashCommandBuilder().setName("server").setDescription("Replies with server info!"),
//   new SlashCommandBuilder().setName("user").setDescription("Replies with user info!"),
// ].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

// rest
//   .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
//   .then(() => console.log("Successfully registered application commands."))
//   .catch(console.error);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
