const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("count").setDescription("Get total server count."),
  async execute(interaction) {
    await interaction.reply(`Online in ${interaction.client.guilds.cache.size} servers!`);
  },
};
