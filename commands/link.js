const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("link").setDescription("Link your The100.io account."),
  async execute(interaction) {
    // BOT-5: no rails API call here, but sending the DM is itself a Discord
    // API round-trip that can be slow (or reject, e.g. DMs closed) --
    // deferring keeps this command in the same safe pattern as the rest.
    // Original reply was ephemeral, so defer ephemeral up front.
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild ? encodeURIComponent(interaction.guild.id) : "";
    const baseUrl = process.env.THE100_BASE_URL || "https://www.the100.io/";
    const content = `Click here to link your account: <${baseUrl}linkdiscord/${encodeURIComponent(
      interaction.user.id
    )}/${encodeURIComponent(interaction.user.username)}?guild_id=${guildId}>`;
    try {
      await interaction.user.send(content);
      return interaction.editReply({ content: "Check your DMs for a link!" });
    } catch (e) {
      console.log("LINK DM ERROR: ");
      console.log(e);
      return interaction.editReply({
        content: "I couldn't send you a DM -- check your privacy settings allow DMs from server members, then try again.",
      });
    }
  },
};
