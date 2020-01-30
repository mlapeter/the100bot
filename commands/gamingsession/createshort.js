const { Command } = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "c",
      aliases: [],
      group: "gamingsession",
      memberName: "c",
      description: "creates gaming session",
      examples: [
        "!create gambit ",
        "!create crucible control 'this is my awesome description'",
        "!create last wish raid"
      ],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        {
          key: "gaming_session_keywords",
          prompt:
            "Type the activity, ex. 'raid', 'last wish', 'gambit'",
          type: "string"
        },
        {
          key: "time",
          prompt:
            "Type the time, ex. 'this sunday at 3pm' or '5:30pm 4/25/20'",
          type: "string",
          validate: text => text.length > 1
        }

      ]
    });
  }
  async run(msg, { gaming_session_keywords, time }) {
    console.log(msg.content);
    let content = `${msg.author.username}#${
      msg.author.discriminator
      } Creating Gaming Session with keywords:${msg.content} in Guild ID: ${
      msg.guild.id
      }`;

    let link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/create_gaming_session?guild_id=${msg.guild.id}&username=${
      msg.author.username
      }&discriminator=${
      msg.author.discriminator
      }&message=${msg.content}&time=${time}`;
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
    let gaming_sessions_list_link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/list_gaming_sessions?guild_id=${msg.guild.id}`;
    if (json.notice.includes("Gaming Session Created!")) {
      const response = await fetch(gaming_sessions_list_link, {
        method: "POST"
      });
      // msg.react("💯");
    } else {
      msg.react("💩");
      return msg.author.send(json.notice);
    }
  }
};
