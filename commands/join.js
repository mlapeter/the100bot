const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Create a new gaming session.")
    .addStringOption((option) => option.setName("id").setDescription("The id of the game to join")),

  async execute(interaction) {
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
      await interaction.reply({ content: "Game Joined!", ephemeral: true });

      // await interaction.message.react("💯");
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
