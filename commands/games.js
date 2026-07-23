const { SlashCommandBuilder } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = {
  data: new SlashCommandBuilder().setName("games").setDescription("Returns a list of upcoming group gaming sessions."),
  async execute(interaction) {
    // BOT-5: postAction round-trips to the rails API and can exceed the 3s
    // interaction window. Original reply was public (not ephemeral), so
    // defer public too.
    await interaction.deferReply();

    const json = await api.postAction({ action: "list_gaming_sessions", interaction: interaction, body: {} });

    await interaction.editReply(json.text);

    if (!json.attachments || !json.attachments.length) {
      // No upcoming games
    } else {
      json.attachments.forEach(function (attachment) {
        discordApi.embedGamingSession(interaction, attachment);
      });
    }
  },
};
