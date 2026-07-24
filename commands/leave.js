const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave a gaming session.")
    .addStringOption((option) =>
      option.setName("id").setDescription("The session ID (shown on the session post)").setRequired(true)
    ),

  async execute(interaction) {
    const gaming_session_id = interaction.options.getString("id");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const json = await api.postAction({
      action: "leave_gaming_session",
      interaction: interaction,
      body: { message: gaming_session_id },
    });
    if (!json) return;

    const { notice } = json;
    await interaction.editReply({ content: notice || "You've left the session." });
  },
};
