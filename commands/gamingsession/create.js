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
      throttling: {
        usages: 4,
        duration: 120
      },
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
    let gaming_sessions_list_link = `http://pwn-staging.herokuapp.com/api/v2/discordbots/list_gaming_sessions?guild_id=${
      msg.guild.id
    }`;
    if (json.notice.includes("Gaming Session Created!")) {
      const response = await fetch(gaming_sessions_list_link, {
        method: "POST"
      });
      msg.react("💯");
    } else {
      msg.react("💩");
    }
    return msg.author.send(json.notice);
  }
};
