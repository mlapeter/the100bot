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
      ]
    });
  }
  async run(msg, { gaming_session_keywords }) {


    // USER INPUTS TIME //
    const timeEmbed = await discordApi.embedText(msg, "Start Time", "What time? ex 'tonight at 7pm' or '11am 2/15/20'")
    const time = await discordApi.getTextResponse(msg)
    await timeEmbed.delete()
    if (!time) { return }
    console.log("TIME: ")
    console.log(time)

    // USER INPUTS OPTIONS //
    const optionsEmbed = await discordApi.embedText(msg, "Options", "Enter options or 'none'. Options: public, group only, sherpa requested, beginners welcome, xbox, ps4, pc, stadia")
    let options = await discordApi.getTextResponse(msg)
    options = options.replace("none", "")

    await optionsEmbed.delete()

    const json = await api.postAction({ action: 'create_gaming_session', msg: msg, body: { message: gaming_session_keywords, time: time, options: options } })

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
