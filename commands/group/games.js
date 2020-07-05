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
      }
    });
  }

  async run(msg) {
    const json = await api.postAction({ action: 'list_gaming_sessions', msg: msg, body: {} })
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
