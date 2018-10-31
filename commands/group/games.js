const { Command } = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class GamesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "games",
      group: "group",
      memberName: "games",
      description: "Returns a list of upcoming group gaming sessions."
    });
  }

  async run(msg) {
    let content = `Listing Gaming Sessions for Guild Id: ${msg.guild.id}`;
    let link = `http://pwn-staging.herokuapp.com/api/v2/discordbots/list_gaming_sessions?guild_id=${
      msg.guild.id
    }`;
    console.log(content);
    const res = await fetch(link, { method: "POST" });
    const json = await res.json();
    console.log(json);

    // return msg.say(`this will post to: ${link}`);
  }
};
