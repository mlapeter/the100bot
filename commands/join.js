const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a gaming session.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to join").setRequired(true)),

  async execute(interaction) {
    // BOT-5: postAction round-trips to the rails API and can exceed the 3s
    // interaction window. Every reply in this command was already
    // ephemeral, so deferring ephemeral up front preserves that exactly.
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const gaming_session_id = interaction.options.getString("id");

    let reserve = false;
    if (gaming_session_id.includes("reserve")) {
      reserve = true;
    }
    const json = await api.postAction({
      action: "join_gaming_session",
      interaction: interaction,
      body: { message: gaming_session_id, reserve: reserve },
    });
    const { notice, gaming_session } = json;

    const substrings = ["reserve", "waitlist", "You just joined"];
    if (substrings.some((v) => notice.includes(v))) {
      await interaction.editReply({ content: "Game Joined!" });
    } else {
      console.log("JOIN ERROR:");
      console.log(notice);
      console.log(interaction);
      await interaction.editReply({ content: notice });
    }
  },
};
