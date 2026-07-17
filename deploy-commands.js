const fs = require("node:fs");
const path = require("path");
require("dotenv").config();

const { REST, Routes } = require("discord.js");

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // With GUILD_ID set, register to that guild only (instant — use for dev).
    // Without it, register globally (can take up to ~1 hour to propagate).
    const route = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);
    const data = await rest.put(route, { body: commands });

    console.log(`Successfully reloaded ${data.length} ${guildId ? `guild (${guildId})` : "global"} (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
