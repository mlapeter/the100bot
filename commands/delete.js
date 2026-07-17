const { SlashCommandBuilder } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a gaming session you created.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to delete").setRequired(true)),

  async execute(interaction) {
    const gaming_session_id = interaction.options.getString("id");

    const json = await api.postAction({
      action: "delete_gaming_session",
      interaction: interaction,
      body: { message: gaming_session_id },
    });
    const { notice, gaming_session } = json;

    const substrings = ["Gaming session deleted"];
    if (substrings.some((v) => notice.includes(v))) {
      await interaction.reply({ content: "Gaming session deleted.", ephemeral: true });
    } else {
      console.log("DELETE ERROR:");
      console.log(notice);
      console.log(interaction);
      await interaction.reply({ content: notice, ephemeral: true });
    }
  },
};
