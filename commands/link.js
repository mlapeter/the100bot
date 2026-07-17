const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("link").setDescription("Link your The100.io account."),
  async execute(interaction) {
    const guildId = interaction.guild ? encodeURIComponent(interaction.guild.id) : "";
    const baseUrl = process.env.THE100_BASE_URL || "https://www.the100.io/";
    const content = `Click here to link your account: <${baseUrl}linkdiscord/${encodeURIComponent(
      interaction.user.id
    )}/${encodeURIComponent(interaction.user.username)}?guild_id=${guildId}>`;
    await interaction.user.send(content);
    return interaction.reply({ content: "Check your DMs for a link!", ephemeral: true });
  },
};
