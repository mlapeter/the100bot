const { Command } = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class CreateCommand extends Command {
  constructor(client) {
    super(client, {
      name: "leave",
      aliases: [],
      group: "gamingsession",
      memberName: "leave",
      description: "Leaves a specified gaming session",
      examples: ["leave 132435"],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        {
          key: "gaming_session_id",
          prompt:
            "What game would you like to leave? Enter the gaming session id:",
          type: "string"
        }
      ]
    });
  }
  async run(msg, { gaming_session_id }) {
    console.log(
      `${msg.author.username}#${
        msg.author.discriminator
      } Leaving Gaming Session ID:${gaming_session_id} in Guild ID: ${
        msg.guild.id
      }`
    );

    let link = `http://pwn-staging.herokuapp.com/api/v2/discordbots/leave_gaming_session?guild_id=${
      msg.guild.id
    }&username=${msg.author.username}&discriminator=${
      msg.author.discriminator
    }&message=${gaming_session_id}`;

    const res = await fetch(link, { method: "POST" });
    const json = await res.json();
    console.log(json);
    if (json.notice.includes("Game left")) {
      // msg.react("💯");
    } else {
      msg.react("💩");
    }
    return msg.author.send(json.notice);
  }
};
