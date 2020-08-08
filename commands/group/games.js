const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const Api = require('../../utils/api')
const api = new Api
const DiscordApi = require('../../utils/discordApi')
const discordApi = new DiscordApi


module.exports = class GamesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "games",
      group: "group",
      memberName: "games",
      description: "Returns a list of upcoming group gaming sessions.",
      throttling: {
        usages: 2,
        duration: 60
      },
      args: [
        {
          key: "options",
          prompt:
            "Type 'all' for all games, and optionally a number to limit games returned.",
          type: "string",
          default: "group"
        }
      ]
    });
  }

  async run(msg, { options }) {
    console.log(msg)
    console.log(options)
    const json = await api.postAction({ action: 'list_gaming_sessions', msg: msg })
    console.log(json)

    msg.say(json.text);

    if (!json.attachments || !json.attachments.length) {
      // No upcoming games
    } else {
      json.attachments.forEach(function (attachment) {
        discordApi.embedGamingSession(msg, attachment)
      });
    }

  }
};
