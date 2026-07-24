const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("link").setDescription("Link your the100.io account to Discord."),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = interaction.guild ? encodeURIComponent(interaction.guild.id) : "";
    const baseUrl = process.env.THE100_BASE_URL || "https://www.the100.io/";
    const linkUrl = `${baseUrl}linkdiscord/${encodeURIComponent(interaction.user.id)}/${encodeURIComponent(
      interaction.user.username
    )}?guild_id=${guildId}&created_from=discord-bot`;

    // Try to DM the link (keeps it private). If the user has DMs closed, fall
    // back to showing it in the ephemeral reply so they're never stuck.
    try {
      await interaction.user.send(
        `Here's your link to connect your the100.io account — it only takes a few seconds:\n${linkUrl}\n\n` +
          "Once you're linked, come back and create or join sessions right here in Discord."
      );
      await interaction.editReply("Check your DMs — I just sent you a link to connect your the100.io account. ✅");
    } catch (e) {
      console.log("Could not DM link, replying inline:");
      console.log(e);
      await interaction.editReply(
        `Here's your link to connect your the100.io account (only takes a few seconds):\n${linkUrl}`
      );
    }
  },
};
