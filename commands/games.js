const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = {
  data: new SlashCommandBuilder().setName("games").setDescription("Returns a list of upcoming group gaming sessions."),
  async execute(interaction) {
    // return interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);

    console.log(interaction);
    // console.log(options)
    const json = await api.postAction({ action: "list_gaming_sessions", interaction: interaction, body: {} });
    console.log(json);
    console.log(json);

    interaction.reply(json.text);

    if (!json.attachments || !json.attachments.length) {
      // No upcoming games
    } else {
      json.attachments.forEach(function (attachment) {
        discordApi.embedGamingSession(interaction, attachment);
      });
    }
  },
};
