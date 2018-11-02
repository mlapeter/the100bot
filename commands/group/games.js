const { Command } = require("discord.js-commando");
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
    let link = `https://pwntastic.herokuapp.com/api/v2/discordbots/list_gaming_sessions?guild_id=${
      msg.guild.id
    }`;
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
      return msg.say(
        "Not Authorized - make sure the bot creator is using the correct API Token."
      );
    }
    const json = await res.json();
    console.log(json);
  }
};
