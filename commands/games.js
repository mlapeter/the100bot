const { SlashCommandBuilder } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = {
  data: new SlashCommandBuilder().setName("games").setDescription("List your group's upcoming gaming sessions."),
  async execute(interaction) {
    // Listing hits the API, so defer to avoid the >3s false-error banner.
    await interaction.deferReply();

    const json = await api.postAction({ action: "list_gaming_sessions", interaction: interaction, body: {} });
    if (!json) return;

    await interaction.editReply(json.text || "Here are your upcoming sessions:");

    if (json.attachments && json.attachments.length) {
      json.attachments.forEach(function (attachment) {
        discordApi.embedGamingSession(interaction, attachment);
      });
    }
  },
};
