const { Command } = require("discord.js-commando");
const Api = require('../../utils/api')
const api = new Api
const DiscordApi = require('../../utils/discordApi')
const discordApi = new DiscordApi

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

    const json = await api.postAction({ action: 'join_gaming_session', msg: msg, body: { message: gaming_session_id } })
    const { notice, gaming_session } = json
    console.log(gaming_session)

    if (notice.includes("You just joined")) {
      msg.say(`*${msg.author}* joined:`)
      await discordApi.embedGamingSession(msg, gaming_session)
    } else {
      // msg.react("💩");
      return msg.author.send(json.notice);
    }
  }
};
