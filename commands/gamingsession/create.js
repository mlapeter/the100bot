const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");

const _ = require("lodash");
const Api = require("../../utils/api");
const api = new Api();
const DiscordApi = require("../../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "create",
      aliases: [],
      group: "gamingsession",
      memberName: "create",
      description: "Creates a new gaming session",
      examples: ["!create last wish raid", "!create gambit'", "!create game the division"],
      throttling: {
        usages: 4,
        duration: 120,
      },
      args: [
        {
          key: "activity",
          prompt:
            "Type part of the  activity like `last wish raid` or `gambit`. To pick a different game than your primary game, type `game` and part of the game name.",
          type: "string",
          default: "none",
        },
      ],
    });
  }

  async run(msg, { activity }) {
    try {
      if (msg.channel.type === "dm") {
        return msg.author.send(
          "Gaming sessions can only be created in public channels, but if you want to create a totally private gaming session you can use our website: <https://www.the100.io/gaming_sessions/new>."
        );
      }

      let json = null;
      let publicGame = false;
      let game = null;

      // FETCH USERS PRIMARY GAME //
      console.log("getting user_primary_game");
      let selectedGame = await api.postAction({ action: "user_primary_game", msg: msg });
      console.log("Selected Game: ");
      console.log(selectedGame);

      // CHECK IF USER HAS LINKED ACCOUNT //
      if (selectedGame && selectedGame.notice) {
        console.log("NOTICE:");
        console.log(selectedGame.notice);
        return msg.author.send(selectedGame.notice);
      }

      if (activity == "cancel") {
        msg.delete();
        return;
      } else if (!activity || activity == "none") {
        console.log("No game selected");
        const helpEmbed = await discordApi.embedText(msg, "", "Type part of the game name like `apex` or `destiny 2`.");
        game = await discordApi.getTextResponse(msg);
        await helpEmbed.delete();
      } else {
        game = activity;
      }

      console.log("game: " + game);

      if (game == "cancel") {
        return;
      }

      if (game || activity.includes("game")) {
        // USER INPUTS GAME STRING //
        console.log("SWITCHING GAME");
        activity = activity.replace("game", "");
        json = await api.postAction({ action: "find_games", msg: msg, body: { game: activity } });

        // SELECT GAME //
        const gamesEmbed = await discordApi.embedTextAndEmojis(
          msg,
          "Select Game:",
          json.results.numbered_results,
          json.results.numbered_emojis
        );
        selectedGame = await discordApi.getEmojiResponse(msg, gamesEmbed, json.results.string_results);
        console.log("SELECTED GAME:");
        console.log(selectedGame);
        await gamesEmbed.delete();
        if (!selectedGame) {
          return;
        }

        const sampleActivities = await api.postAction({
          action: "find_activities",
          msg: msg,
          body: { activity: "", game: selectedGame },
        });

        const example1 = _.sample(sampleActivities.results.all_activities);
        const example2 = _.sample(sampleActivities.results.all_activities);

        const activitiesListEmbed = await discordApi.embedText(
          msg,
          selectedGame,
          `What activity? ex '${example1}' or '${example2}'.`
        );
        activity = await discordApi.getTextResponse(msg);
        await activitiesListEmbed.delete();
        if (!activity) {
          return;
        }
      }

      if (!activity) {
        return;
      }

      // SEARCH ACTIVITIES //
      json = await api.postAction({
        action: "find_activities",
        msg: msg,
        body: { activity: activity, game: selectedGame },
      });

      // SELECT ACTIVITY //
      const activitiesEmbed = await discordApi.embedTextAndEmojis(
        msg,
        "Select Activity:",
        json.results.numbered_results,
        json.results.numbered_emojis
      );
      const selectedActivity = await discordApi.getEmojiResponse(msg, activitiesEmbed, json.results.string_results);
      await activitiesEmbed.delete();
      if (!selectedActivity) {
        return;
      }

      // USER INPUTS TIME //
      const timeEmbed = await discordApi.embedText(
        msg,
        selectedActivity,
        "What time? Type 'asap' to start as soon as it fills, or schedule a time: 'tonight at 7pm' or '11am 2/15/20'"
      );
      const startTime = await discordApi.getTextResponse(msg);
      await timeEmbed.delete();
      if (!startTime) {
        return;
      }

      // USER INPUTS DESCRIPTION //
      const descriptionEmbed = await discordApi.embedText(msg, selectedActivity, "Enter description or 'none':");
      let description = await discordApi.getTextResponse(msg);
      description = description ? description.replace("none", "") : "";

      await descriptionEmbed.delete();

      // USER INPUTS OPTIONS //
      const optionsEmbed = await discordApi.embedText(
        msg,
        selectedActivity,
        "Enter options or 'none'. Options: public, sherpa requested, beginners welcome, xbox, ps4, pc, stadia"
      );
      let options = await discordApi.getTextResponse(msg);
      options = options ? options.replace("none", "") : "";

      await optionsEmbed.delete();

      // CREATE GAMING SESSION //

      const loadingEmbed = await discordApi.embedText(msg, `Creating Gaming Session...`, "");
      setTimeout(function () {
        loadingEmbed.delete();
      }, 2000);

      const createGameMessage = selectedActivity + ' "' + description + '"';
      const createGameJson = await api.postAction({
        action: "create_gaming_session",
        msg: msg,
        body: { game: selectedGame, message: createGameMessage, time: startTime, options: options },
      });

      // EMBED RETURNED GAMING SESSION //
      const { notice, gaming_session } = createGameJson;
      console.log("CREATE GAME JSON");
      console.log(createGameJson);
      if (notice.includes("Gaming Session Created!")) {
        discordApi.embedGamingSessionWithReactions(msg, gaming_session);
      } else {
        msg.react("💩");
        return msg.author.send(notice);
      }
    } catch (e) {
      console.log(e);
      msg.react("💩");
      return msg.author.send(
        "Type !link to link your The100.io account first, or contact us at <https://www.the100.io/help>"
      );
    }
  }
};
