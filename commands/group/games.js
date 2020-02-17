const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const Api = require('../../utils/api')
const api = new Api


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

    msg.say(json.text);
    if (!json.attachments || !json.attachments.length) {
      // No upcoming games
    } else {
      json.attachments.forEach(function (attachment) {
        console.log(attachment);
        const embed = new RichEmbed()
          .setTitle(attachment.title)
          .setURL(attachment.title_link)
          .setDescription(attachment.text)
          .setColor(attachment.color);
        msg.embed(embed);
      });
    }

  }
};
