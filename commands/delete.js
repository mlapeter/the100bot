const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a gaming session you created.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to delete").setRequired(true)),

  async execute(interaction) {
    // BOT-5: postAction round-trips to the rails API and can exceed the 3s
    // interaction window. Every reply in this command was already
    // ephemeral, so deferring ephemeral up front preserves that exactly.
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const gaming_session_id = interaction.options.getString("id");

    const json = await api.postAction({
      action: "delete_gaming_session",
      interaction: interaction,
      body: { message: gaming_session_id },
    });
    const { notice, gaming_session } = json;

    const substrings = ["Gaming session deleted"];
    if (substrings.some((v) => notice.includes(v))) {
      await interaction.editReply({ content: "Gaming session deleted." });
    } else {
      console.log("DELETE ERROR:");
      console.log(notice);
      console.log(interaction);
      await interaction.editReply({ content: notice });
    }
  },
};
