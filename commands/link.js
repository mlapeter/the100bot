const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("link").setDescription("Link your The100.io account."),
  async execute(interaction) {
    const guildId = interaction.guild ? encodeURIComponent(interaction.guild.id) : "";
    const content = `Click here to link your account: <https://the100.io/linkdiscord/${encodeURIComponent(
      interaction.user.id
    )}/${encodeURIComponent(interaction.user.username)}?guild_id=${guildId}>`;
    return interaction.user.send(content);
  },
};
