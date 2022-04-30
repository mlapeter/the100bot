const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Create a new gaming session.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to delete")),

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
      console.log("ERROR:");
      console.log(notice);
      console.log(interaction);
      await interaction.reply({ content: notice, ephemeral: true });
    }
  },
};
