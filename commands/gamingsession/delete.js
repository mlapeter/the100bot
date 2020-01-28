const { Command } = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class CreateCommand extends Command {
  constructor(client) {
    super(client, {
      name: "delete",
      aliases: [],
      group: "gamingsession",
      memberName: "delete",
      description: "Deletes a specified gaming session",
      examples: ["delete 132435"],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        {
          key: "gaming_session_id",
          prompt:
            "What game would you like to delete? Enter the gaming session id:",
          type: "string"
        }
      ]
    });
  }
  async run(msg, { gaming_session_id }) {
    console.log(
      `${msg.author.username}#${
      msg.author.discriminator
      } Deleting Gaming Session ID:${gaming_session_id} in Guild ID: ${
      msg.guild.id
      }`
    );

    let link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/delete_gaming_session?guild_id=${msg.guild.id}&username=${
      msg.author.username
      }&discriminator=${msg.author.discriminator}&message=${gaming_session_id}`;

    const res = await fetch(link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN
      }
    });
    console.log(res.status);
    if (res.status !== 201) {
      console.log(res)
      return msg.say(
        "Not Authorized - make sure the bot creator is using the correct API Token."
      );
    }
    const json = await res.json();
    console.log(json);
    if (json.notice.includes("Gaming session deleted")) {
      msg.react("💯");
    } else {
      msg.react("💩");
    }
    return msg.author.send(json.notice);
  }
};
