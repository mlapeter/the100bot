const { Command } = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "create",
      aliases: [],
      group: "gamingsession",
      memberName: "create",
      description: "Joins specified gaming session",
      examples: [
        "!create gambit this sunday at 3pm",
        "!create crucible control tomorrow at 5pm 'this is my awesome description'",
        "!create last wish raid 3 days from now at 5pm"
      ],
      args: [
        {
          key: "gaming_session_keywords",
          prompt:
            "Type the activity and time, for example gambit this sunday at 3pm",
          type: "string"
        }
      ]
    });
  }
  async run(msg, { gaming_session_keywords }) {
    console.log(msg.content);
    let content = `${msg.author.username}#${
      msg.author.discriminator
    } Creating Gaming Session with keywords:${gaming_session_keywords} in Guild ID: ${
      msg.guild.id
    }`;

    let link = `http://pwn-staging.herokuapp.com/api/v2/discordbots/create_gaming_session?guild_id=${
      msg.guild.id
    }&username=${msg.author.username}&discriminator=${
      msg.author.discriminator
    }&message=${gaming_session_keywords}`;
    console.log(content);
    const res = await fetch(link, { method: "POST" });
    const json = await res.json();
    console.log(json);
    return msg.author.send(json.notice);
  }
};
