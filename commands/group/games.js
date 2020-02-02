const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");

const fetch = require("node-fetch");

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
    let content = `Listing Gaming Sessions for Guild Id: ${msg.guild.id}`;
    let link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/list_gaming_sessions?guild_id=${msg.guild.id}`;
    console.log(content);
    const res = await fetch(link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN
      }
    });
    console.log(res.status);
    if (res.status !== 201) {
      console.log("Games.js Auth Error")
      console.log(res);

      return msg.say(
        "Not Authorized! - make sure the bot creator is using the correct API Token."
      );
    } else {
      const json = await res.json();
      console.log(json);
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
  }
};
