const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("leave a gaming session.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to leave")),

  async execute(interaction) {
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
      // await interaction.message.react("💯");
      await interaction.reply({ content: "Game left.", ephemeral: true });
    } else {
      // await interaction.deferUpdate();
      console.log("ERROR:");
      console.log(notice);
      console.log(interaction);
      await interaction.reply({ content: notice, ephemeral: true });

      // interaction.react("💩");
      // await interaction.reply(notice);

      // return interaction.author.send(json.notice);
    }
  },
};
