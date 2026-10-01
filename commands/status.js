const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("the100status")
    .setDescription("Check that the bot and your group's webhook are connected."),
  async execute(interaction) {
    // Reply immediately (well under the 3s window), then fill in the details.
    // Ephemeral: the result can include a reconnect link meant for mods, and a
    // status check shouldn't add chatter to the channel.
    await interaction.reply({ content: "Checking your connection...", flags: MessageFlags.Ephemeral });

    const json = await api.postAction({ action: "bot_status", interaction: interaction, body: {} });
    if (!json) return;

    await interaction.editReply(json.text ? json.text : "I'm online! ✅");
  },
};
