const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a gaming session.")
    .addStringOption((option) =>
      option.setName("id").setDescription("The session ID (shown on the session post)").setRequired(true)
    ),

  async execute(interaction) {
    const gaming_session_id = interaction.options.getString("id");

    // Joining is an API round-trip, so defer first (avoids the false-error
    // banner when it takes >3s). Ephemeral so only the joiner sees the reply.
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let reserve = false;
    if (gaming_session_id.includes("reserve")) {
      reserve = true;
    }
    const json = await api.postAction({
      action: "join_gaming_session",
      interaction: interaction,
      body: { message: gaming_session_id, reserve: reserve },
    });
    if (!json) return;

    const { notice } = json;
    // The API notice is already specific and friendly (e.g. "You just joined X!"
    // or "Joined on waitlist!"), so show it directly.
    await interaction.editReply({ content: notice || "Done!" });
  },
};
