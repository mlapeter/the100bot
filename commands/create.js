const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();
const chrono = require("chrono-node");
const { MessageEmbed } = require("discord.js");
const _ = require("lodash");

module.exports = {
  data: new SlashCommandBuilder().setName("create").setDescription("Create a new gaming session."),
  async execute(interaction) {
    // try {
    // return if user is in a DM channel

    // console.log("VALUE:");
    // console.log(value);

    await interaction.deferReply();

    let json = null;
    let game = null;
    let activity = null;

    // FETCH USERS PRIMARY GAME //
    console.log("getting user_primary_game");
    let selectedGame = await api.postAction({ action: "user_primary_game", interaction: interaction });
    console.log("Selected Game: ");
    console.log(selectedGame);

    // CHECK IF USER HAS LINKED ACCOUNT //
    if (selectedGame && selectedGame.notice) {
      console.log("NOTICE:");
      console.log(selectedGame.notice);
      return interaction.user.send(selectedGame.notice);
    }

    // USER INPUTS GAME STRING //
    const helpEmbed = await discordApi.embedText(
      interaction,
      "",
      "Type part of the game name like `apex` or `destiny 2`."
    );

    // const finishedHelpEmbed = await interaction.reply({ embeds: [helpEmbed], ephemeral: true });

    game = await discordApi.getTextResponse(interaction);

    console.log("GAME IS:");
    console.log(game);
    await helpEmbed.delete();

    if (!game || game == "cancel") {
      return;
    }

    // USER SELECTS GAME //
    json = await api.postAction({ action: "find_games", interaction: interaction, body: { game: game } });
    const gamesEmbed = await discordApi.embedTextAndEmojis(
      interaction,
      "Select Game:",
      json.results.numbered_results,
      json.results.numbered_emojis
    );

    selectedGame = await discordApi.getEmojiResponse(
      interaction,
      gamesEmbed,
      json.results.numbered_emojis,
      json.results.string_results
    );

    console.log("SELECTED GAME:");
    console.log(selectedGame);
    await gamesEmbed.delete();
    if (!selectedGame) {
      return;
    }

    // USER TYPES ACTIVITY STRING //
    const sampleActivities = await api.postAction({
      action: "find_activities",
      interaction: interaction,
      body: { activity: "", game: selectedGame },
    });

    const example1 = _.sample(sampleActivities.results.all_activities);
    const example2 = _.sample(sampleActivities.results.all_activities);

    const activitiesListEmbed = await discordApi.embedText(
      interaction,
      selectedGame,
      `What activity? ex '${example1}' or '${example2}'.`
    );

    activity = await discordApi.getTextResponse(interaction);
    await activitiesListEmbed.delete();
    if (!activity) {
      return;
    }

    // SEARCH ACTIVITIES //
    json = await api.postAction({
      action: "find_activities",
      interaction: interaction,
      body: { activity: activity, game: selectedGame },
    });

    // USER SELECTS ACTIVITY //
    const activitiesEmbed = await discordApi.embedTextAndEmojis(
      interaction,
      "Select Activity:",
      json.results.numbered_results,
      json.results.numbered_emojis
    );
    const selectedActivity = await discordApi.getEmojiResponse(
      interaction,
      activitiesEmbed,
      json.results.numbered_emojis,
      json.results.string_results
    );

    console.log("SELECTED ACTIVITY:");
    console.log(selectedActivity);

    await activitiesEmbed.delete();
    if (!selectedActivity) {
      return;
    }

    // USER INPUTS TIME //
    const timeEmbed = await discordApi.embedText(
      interaction,
      selectedActivity,
      "What time? Type 'asap' to start as soon as it fills, or schedule a time: 'tonight at 7pm' or '11am 2/15/20'"
    );
    const startTime = await discordApi.getTextResponse(interaction);
    await timeEmbed.delete();
    if (!startTime) {
      return;
    }

    // USER INPUTS DESCRIPTION //
    const descriptionEmbed = await discordApi.embedText(interaction, selectedActivity, "Enter description or 'none':");
    let description = await discordApi.getTextResponse(interaction);
    description = description ? description.replace("none", "") : "";
    await descriptionEmbed.delete();

    // USER INPUTS OPTIONS //
    const optionsEmbed = await discordApi.embedText(
      interaction,
      selectedActivity,
      "Enter options or 'none'. Options: public, sherpa requested, beginners welcome, xbox, ps4, pc, stadia"
    );
    let options = await discordApi.getTextResponse(interaction);
    options = options ? options.replace("none", "") : "";
    await optionsEmbed.delete();

    // CREATE GAMING SESSION //
    const loadingEmbed = await discordApi.embedText(interaction, `Creating Gaming Session...`, "");
    setTimeout(function () {
      loadingEmbed.delete();
    }, 2000);

    const createGameMessage = selectedActivity + ' "' + description + '"';
    const createGameJson = await api.postAction({
      action: "create_gaming_session",
      interaction: interaction,
      body: { game: selectedGame, message: createGameMessage, time: startTime, options: options },
    });

    // EMBED RETURNED GAMING SESSION //
    const { notice, gaming_session } = createGameJson;
    console.log("CREATE GAME JSON");
    console.log(createGameJson);
    if (notice.includes("Gaming Session Created!")) {
      discordApi.embedGamingSessionWithReactions(interaction, gaming_session);
    } else {
      interaction.react("💩");
      return interaction.author.send(notice);
    }
  },
};
