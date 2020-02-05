const { Command } = require("discord.js-commando");
const Api = require('../../utils/api')
const api = new Api
const DiscordApi = require('../../utils/discordApi')
const discordApi = new DiscordApi

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
    const json = await api.postAction({ action: 'create_gaming_session', msg: msg, body: { message: gaming_session_keywords, time: time } })

    // EMBED RETURNED GAMING SESSION //
    const { notice, gaming_session } = json
    if (notice.includes("Gaming Session Created!")) {
      msg.say(`*${msg.author}* created:`)
      await discordApi.embedGamingSession(msg, gaming_session)
    } else {
      msg.react("💩");
      return msg.author.send(notice);
    }
  }

};
