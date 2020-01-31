const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const fetch = require("node-fetch");

const Api = require('../../utils/api')
const api = new Api

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "create",
      aliases: [],
      group: "gamingsession",
      memberName: "create",
      description: "Creates a new gaming session",
      examples: [
        "!create d2",
        "!create destiny 2'",
        "!create division"
      ],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        // {
        //   key: "game",
        //   prompt:
        //     "Type part of the game name. ex 'destiny', 'd2', 'grand theft'",
        //   type: "string"
        // },
        {
          key: "activity",
          prompt:
            "Type part of the Destiny 2 activity like `last wish raid` or `gambit`. To pick a different game, type `game` and part of the game name.",
          type: "string"
        },
      ]
    });
  }

  // Todo:
  // Make game default to user or group game
  // Add error handling
  // 


  async run(msg, { game, activity, time }) {

    // // USER INPUTS GAME STRING //
    // let json = await api.postAction({ action: 'find_games', msg: msg, body: { game } })

    // // SELECT GAME //
    // const gamesEmbed = await this.embedTextAndEmojis(msg, "Select Game:", json.results.numbered_results, json.results.numbered_emojis)
    // const selectedGame = await this.getEmojiResponse(msg, gamesEmbed, json.results.string_results)
    // await gamesEmbed.delete();


    let json = null
    const selectedGame = "Destiny 2"

    // USER INPUTS ACTIVITY //

    if (activity.includes("game")) {

      // USER INPUTS GAME STRING //
      console.log("SWITCHING GAME")
      activity = activity.replace("game", "")
      json = await api.postAction({ action: 'find_games', msg: msg, body: { game: activity } })


      // SELECT GAME //
      const gamesEmbed = await this.embedTextAndEmojis(msg, "Select Game:", json.results.numbered_results, json.results.numbered_emojis)
      const selectedGame = await this.getEmojiResponse(msg, gamesEmbed, json.results.string_results)
      await gamesEmbed.delete();

      const activitiesListEmbed = await this.embedText(msg, selectedGame, "What activity? ex 'last wish raid' or 'gambit'.")
      activity = await this.getTextResponse(msg)
      await activitiesListEmbed.delete();
    }

    // SEARCH ACTIVITIES //
    json = await api.postAction({ action: 'find_activities', msg: msg, body: { activity: activity, game: selectedGame } })


    // SELECT ACTIVITY //
    const activitiesEmbed = await this.embedTextAndEmojis(msg, "Select Activity:", json.results.numbered_results, json.results.numbered_emojis)
    const selectedActivity = await this.getEmojiResponse(msg, activitiesEmbed, json.results.string_results)
    await activitiesEmbed.delete();


    // USER INPUTS TIME //
    const timeEmbed = await this.embedText(msg, selectedActivity, "What time? ex 'tonight at 7pm' or '11am 2/15/20'")
    const startTime = await this.getTextResponse(msg)
    await timeEmbed.delete()


    // USER INPUTS DESCRIPTION //
    const descriptionEmbed = await this.embedText(msg, selectedActivity, startTime + "\n Enter description or 'none':")
    let description = await this.getTextResponse(msg)
    description = description.replace("none", "")
    await descriptionEmbed.delete()


    // CREATE GAMING SESSION //
    const loadingEmbed = await this.embedText(msg, "Creating Gaming Session...", "")
    setTimeout(function () { loadingEmbed.delete() }, 2000);

    const createGameMessage = selectedActivity + ' "' + description + '"'
    const createGameJson = await api.postAction({ action: 'create_gaming_session', msg: msg, body: { message: createGameMessage, time: startTime } })

    // LIST GAMING SESSIONS //
    if (createGameJson.notice.includes("Gaming Session Created!")) {
      await api.postAction({ action: 'list_gaming_sessions', msg: msg, body: {} })
    } else {
      msg.react("💩");
    }
    return msg.author.send(createGameJson.notice);
  }

  async getTextResponse(msg) {
    const filter = m => m.author.id === msg.author.id
    const responses = await msg.channel.awaitMessages(filter, { max: 1, time: 40000, errors: ['time'] })
    const response = responses.first().content;
    return response
  }

  async getEmojiResponse(msg, embed, results) {
    const emojiHash = { '1️⃣': 0, '2️⃣': 1, '3️⃣': 2, '4️⃣': 3, '5️⃣': 4, '6️⃣': 5, '7️⃣': 6, '8️⃣': 7, '9️⃣': 8 }

    let filter = (reaction, user) => user.id === msg.author.id
    let userReactions = await embed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
    let reaction = userReactions.first();
    let activityIndex = emojiHash[reaction.emoji.name]
    console.log("getEmojiResponse: ")
    console.log(activityIndex)
    console.log(results)
    console.log(results[activityIndex])
    const selected = results[activityIndex]

    if (!selected) {
      return msg.say(
        "Game Creation Canceled."
      );
    }
    return selected
  }

  async embedText(msg, title, description) {
    const embed = new RichEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x00ae86);
    return await msg.embed(embed)
  }


  async embedTextAndEmojis(msg, title, description, emojis) {
    const embed = await this.embedText(msg, title, description)
    emojis.forEach(async emoji => {
      try {
        await embed.react('1️⃣')
        embed.react(emoji)
        console.log(emoji)
      } catch (e) {
        console.log("Emoji error: ")
        console.log(e)
      }
    });

    return embed
  }
};