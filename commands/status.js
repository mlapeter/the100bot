const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder().setName("the100status").setDescription("Check the status of the bot."),
  async execute(interaction) {
    console.log("STARTING STATUS");

    await interaction.reply(`Online!`);

    const json = await api.postAction({ action: "bot_status", interaction: interaction, body: {} });
    console.log(json);

    await interaction.editReply(`Online! ${json.text ? json.text : ""}`);
  },
};
