const { Command } = require("discord.js-commando");
const Api = require("../../utils/api");
const api = new Api();
const DiscordApi = require("../../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "c",
      aliases: [],
      group: "gamingsession",
      memberName: "c",
      description:
        "quick create gaming session in one line: !create crucible control 'this is my awesome description'",
      examples: [
        "!create gambit ",
        "!create crucible control 'this is my awesome description'",
        "!create last wish raid",
      ],
      throttling: {
        usages: 4,
        duration: 120,
      },
      args: [
        {
          key: "gaming_session_keywords",
          prompt: "Type the activity, ex. 'raid', 'last wish', 'gambit'",
          type: "string",
        },
      ],
    });
  }
  async run(msg, { gaming_session_keywords }) {
    console.log("STARTING CREATE SHORT");
    const regex = /( in | at | on )\s*(.+)/i;
    const match = regex.exec(gaming_session_keywords);
    let time = null;
    let remainder = null;
    if (match) {
      time = match[0];
      remainder = gaming_session_keywords.replace(time, "");
    }

    // get the remainder of the string

    console.log("TIME: ");
    console.log(time);
    console.log("REMAINDER: ");
    console.log(remainder);

    // fetch data at: https://www.the100.io/api/v2/games

    // USER INPUTS TIME //
    // const timeEmbed = await discordApi.embedText(msg, "Start Time", "What time? ex 'tonight at 7pm' or '11am 2/15/20'")
    // const time = await discordApi.getTextResponse(msg)
    // await timeEmbed.delete()
    // if (!time) { return }
    // console.log("TIME: ")
    // console.log(time)

    // // USER INPUTS OPTIONS //
    // const optionsEmbed = await discordApi.embedText(msg, "Options", "Enter options or 'none'. Options: public, group only, sherpa requested, beginners welcome, xbox, ps4, pc, stadia")
    // let options = await discordApi.getTextResponse(msg)
    // options = options.replace("none", "")

    // await optionsEmbed.delete()

    const json = await api.postAction({
      action: "create_gaming_session_simple",
      msg: msg,
      body: { message: remainder, time: time },
    });

    // EMBED RETURNED GAMING SESSION //
    const { notice, gaming_session } = json;
    if (notice.includes("Gaming Session Created!")) {
      // msg.react("💯");
      discordApi.embedGamingSessionWithReactions(msg, gaming_session);
    } else {
      msg.react("💩");
      return msg.author.send(notice);
    }
  }
};
