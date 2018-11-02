const { Command } = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      aliases: [],
      group: "gamingsession",
      memberName: "join",
      description: "Joins specified gaming session",
      examples: ["join 132435"],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        {
          key: "gaming_session_id",
          prompt:
            "What game would you like to join? Enter the gaming session id:",
          type: "string"
        }
      ]
    });
  }
  async run(msg, { gaming_session_id }) {
    console.log(msg.content);
    let content = `${msg.author.username}#${
      msg.author.discriminator
    } Joining Gaming Session ID:${gaming_session_id} in Guild ID: ${
      msg.guild.id
    }`;

    let link = `https://pwntastic.herokuapp.com/api/v2/discordbots/join_gaming_session?guild_id=${
      msg.guild.id
    }&username=${msg.author.username}&discriminator=${
      msg.author.discriminator
    }&message=${gaming_session_id}`;
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
    if (json.notice.includes("You just joined")) {
      // msg.react("💯");
    } else {
      msg.react("💩");
    }
    return msg.author.send(json.notice);
  }
};
