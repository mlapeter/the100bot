const { SlashCommandBuilder, ChannelType, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();
const chrono = require("chrono-node");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("c")
    .setDescription("Quickly create a session, e.g. /c apex legends tonight at 8pm")
    .addStringOption((option) =>
      option.setName("input").setDescription("What and when, e.g. 'apex legends tomorrow at 9pm'")
    ),
  async execute(interaction) {
    const value = interaction.options.getString("input");

    // No input: show a short how-to. (Fast path — no need to defer.)
    if (!value || value == "none") {
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");
      return await interaction.reply({
        content: "Here's how to create a session:",
        embeds: [helpEmbed],
      });
    }

    // Sessions need a server channel to post into.
    if (interaction.channel?.type === ChannelType.DM) {
      return interaction.reply({
        content:
          "I can only create sessions inside a server channel. To make a fully private session, use the website instead: <https://www.the100.io/gaming_sessions/new>.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const results = chrono.parse(value);
    // Couldn't find a time in the input.
    if (!results || results.length == 0) {
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");
      return await interaction.reply({
        content:
          "I couldn't spot a time in there. Try including when it starts, like `apex legends tomorrow at 3pm`.",
        embeds: [helpEmbed],
      });
    }

    const time_text = results[0].text;
    const remainder = value.replace(time_text, "").trim();

    // Creating the session is an API round-trip, so defer first — otherwise the
    // interaction token can expire (>3s) and Discord shows a false error banner
    // even when the session was created (BOT-5).
    await interaction.deferReply();

    const json = await api.postAction({
      action: "create_gaming_session_simple",
      interaction: interaction,
      body: { message: remainder ? remainder : value, time: time_text },
    });

    // postAction already showed an error message on failure.
    if (!json) return;

    const { notice, gaming_session } = json;
    if (notice && notice.includes("Gaming Session Created!")) {
      discordApi.embedGamingSessionWithReactions(interaction, gaming_session);
      await interaction.editReply("Session created! 🎮 Use the **Join** button on the post to hop in.");
    } else {
      await interaction.editReply({ content: notice });
    }
  },
};
