const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave a gaming session.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to leave").setRequired(true)),

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
      action: "leave_gaming_session",
      interaction: interaction,
      body: { message: gaming_session_id },
    });
    const { notice, gaming_session } = json;

    const substrings = ["Game left"];
    if (substrings.some((v) => notice.includes(v))) {
      await interaction.editReply({ content: "Game left." });
    } else {
      console.log("LEAVE ERROR:");
      console.log(notice);
      console.log(interaction);
      await interaction.editReply({ content: notice });
    }
  },
};
