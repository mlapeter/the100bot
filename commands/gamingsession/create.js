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
        {
          key: "game",
          prompt:
            "Type part of the game name. ex 'destiny', 'd2', 'grand theft'",
          type: "string"
        },
      ]
    });
  }

  // Todo:
  // Dry up code
  // Make game default to user or group game
  // Add error handling
  // 


  async run(msg, { game, activity, time }) {
    const emojiHash = { '1️⃣': 0, '2️⃣': 1, '3️⃣': 2, '4️⃣': 3, '5️⃣': 4, '6️⃣': 5, '7️⃣': 6, '8️⃣': 7, '9️⃣': 8 }

    // SELECT GAME //

    let json = await api.postAction({ action: 'find_games', msg: msg, body: { game } })

    const gamesEmbed = await this.embedTextAndEmojis(msg, "Select Game:", json.results.numbered_results, json.results.numbered_emojis)

    let selectedGame = null

    try {
      let filter = (reaction, user) => user.id === msg.author.id
      let userReactions = await gamesEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
      let reaction = userReactions.first();
      let activityIndex = emojiHash[reaction.emoji.name]

      selectedGame = json.results.string_results[activityIndex]

    } catch (e) {
      console.log("Error:")
      console.log(e)
    }
    await gamesEmbed.delete();



    // SELECT ACTIVITY //

    const whichActivityEmbed = await this.embedText(msg, selectedGame, "What activity? ex 'last wish raid' or 'gambit'")

    let pickedActivity = await this.getTextResponse(msg)

    json = await api.postAction({ action: 'find_activities', msg: msg, body: { activity: pickedActivity, game: selectedGame } })

    const activitiesEmbed = await this.embedTextAndEmojis(msg, "Select Activity:", json.results.numbered_results, json.results.numbered_emojis)

    let selectedActivity = null
    try {
      const filter = (reaction, user) => user.id === msg.author.id
      const userReactions = await activitiesEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
      const reaction = userReactions.first();
      const activityIndex = emojiHash[reaction.emoji.name]
      selectedActivity = json.results.numbered_results[activityIndex]
    } catch (e) {
      console.log("Error:")
      console.log(e)
    }
    await activitiesEmbed.delete();

    if (!selectedActivity) {
      return msg.say(
        "Game Creation Canceled."
      );
    }

    // SELECT TIME //

    const timeEmbed = await this.embedText(msg, selectedActivity, "What time? ex 'tonight at 7pm' or '11am 2/15/20'")

    let startTime = await this.getTextResponse(msg)

    await timeEmbed.delete()

    const descriptionEmbed = await this.embedText(msg, selectedActivity, startTime + "\n Enter description or 'none':")

    let description = await this.getTextResponse(msg)
    description = description.replace("none", "")

    await descriptionEmbed.delete()

    const loadingEmbed = await this.embedText(msg, "Creating Gaming Session...", "")

    setTimeout(function () { loadingEmbed.delete() }, 2000);

    const createGameMessage = selectedActivity + ' "' + description + '"'
    const createGameJson = await api.postAction({ action: 'create_gaming_session', msg: msg, body: { message: createGameMessage, time: startTime } })

    let gaming_sessions_list_link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/list_gaming_sessions?guild_id=${msg.guild.id}`;

    if (createGameJson.notice.includes("Gaming Session Created!")) {
      const response = await api.post(gaming_sessions_list_link)
    } else {
      msg.react("💩");
    }
    return msg.author.send(createGameJson.notice);
  }

  async getTextResponse(msg) {
    const filter = m => m.author.id === msg.author.id
    const responses = await msg.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
    const response = responses.first().content;
    return response
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
      await embed.react('1️⃣')
      embed.react(emoji)
    });

    return embed
  }
};