const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const fetch = require("node-fetch");
const _ = require('lodash');
const Api = require('../../utils/api')
const api = new Api
const DiscordApi = require('../../utils/discordApi')
const discordApi = new DiscordApi

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "create",
      aliases: [],
      group: "gamingsession",
      memberName: "create",
      description: "Creates a new gaming session",
      examples: [
        "!create last wish raid",
        "!create gambit'",
        "!create game the division"
      ],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        {
          key: "activity",
          prompt:
            "Type part of the  activity like `last wish raid` or `gambit`. To pick a different game than your primary game, type `game` and part of the game name.",
          type: "string",
          default: "none"
        },
      ]
    });
  }

  async run(msg, { activity }) {

    try {
      let json = null
      let publicGame = false

      // FETCH USERS PRIMARY GAME //
      console.log("getting user_primary_game")
      let selectedGame = await api.postAction({ action: 'user_primary_game', msg: msg })
      console.log("Selected Game: ")
      console.log(selectedGame)

      if (selectedGame.notice) {
        msg.react("💩");
        return msg.author.send(selectedGame.notice);
      }

      // USER INPUTS ACTIVITY //
      if (activity == "cancel") {
        msg.delete()
      } else if (activity == "none" || (activity.includes("game") && !activity.match(/\bgame\s+(.*)$/))) {
        const helpEmbed = await discordApi.embedText(msg, "", "Type part of the activity like `last wish raid` or `gambit`. To pick a different game than your primary game, type `game` and part of the game name.")
        activity = await discordApi.getTextResponse(msg)
        await helpEmbed.delete()
      }

      if (!activity) { return }


      if (activity.includes("game")) {

        // USER INPUTS GAME STRING //
        console.log("SWITCHING GAME")
        activity = activity.replace("game", "")
        json = await api.postAction({ action: 'find_games', msg: msg, body: { game: activity } })


        // SELECT GAME //
        const gamesEmbed = await discordApi.embedTextAndEmojis(msg, "Select Game:", json.results.numbered_results, json.results.numbered_emojis)
        selectedGame = await discordApi.getEmojiResponse(msg, gamesEmbed, json.results.string_results)
        await gamesEmbed.delete();
        if (!selectedGame) { return }

        const sampleActivities = await api.postAction({ action: 'find_activities', msg: msg, body: { activity: "", game: selectedGame } })

        const example1 = _.sample(sampleActivities.results.all_activities);
        const example2 = _.sample(sampleActivities.results.all_activities);

        const activitiesListEmbed = await discordApi.embedText(msg, selectedGame, `What activity? ex '${example1}' or '${example2}'.`)
        activity = await discordApi.getTextResponse(msg)
        await activitiesListEmbed.delete();
        if (!activity) { return }
      }


      // SEARCH ACTIVITIES //
      json = await api.postAction({ action: 'find_activities', msg: msg, body: { activity: activity, game: selectedGame } })


      // SELECT ACTIVITY //
      const activitiesEmbed = await discordApi.embedTextAndEmojis(msg, "Select Activity:", json.results.numbered_results, json.results.numbered_emojis)
      const selectedActivity = await discordApi.getEmojiResponse(msg, activitiesEmbed, json.results.string_results)
      await activitiesEmbed.delete();
      if (!selectedActivity) { return }


      // USER INPUTS TIME //
      const timeEmbed = await discordApi.embedText(msg, selectedActivity, "What time? ex 'tonight at 7pm' or '11am 2/15/20'")
      const startTime = await discordApi.getTextResponse(msg)
      await timeEmbed.delete()
      if (!startTime) { return }


      // USER INPUTS DESCRIPTION //
      const descriptionEmbed = await discordApi.embedText(msg, selectedActivity, "Enter description or 'none':")
      let description = await discordApi.getTextResponse(msg)
      description = description ? description.replace("none", "") : ""

      await descriptionEmbed.delete()


      // USER INPUTS OPTIONS //
      const optionsEmbed = await discordApi.embedText(msg, selectedActivity, "Enter options or 'none'. Options: public, group only, sherpa requested, beginners welcome, xbox, ps4, pc, stadia")
      let options = await discordApi.getTextResponse(msg)
      options = options ? options.replace("none", "") : ""

      await optionsEmbed.delete()


      // CREATE GAMING SESSION //

      const loadingEmbed = await discordApi.embedText(msg, `Creating Gaming Session...`, "")
      setTimeout(function () { loadingEmbed.delete() }, 2000);

      const createGameMessage = selectedActivity + ' "' + description + '"'
      const createGameJson = await api.postAction({ action: 'create_gaming_session', msg: msg, body: { game: selectedGame, message: createGameMessage, time: startTime, options: options } })


      // EMBED RETURNED GAMING SESSION //
      const { notice, gaming_session } = createGameJson
      if (notice.includes("Gaming Session Created!")) {
        msg.react("💯");
      } else {
        msg.react("💩");
        return msg.author.send(notice);
      }


    } catch (e) {
      console.log(e)
      msg.react("💩");
      return msg.author.send("Type !link to link your The100.io account first, or contact us at <https://www.the100.io/help>");
    }
  }
};