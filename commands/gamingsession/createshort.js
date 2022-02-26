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
      description: "Type a game and time, like: `!c Apex Legends in 5 hours`",
      // defaultHandling: false,
      examples: ["!c Apex Legends in 5 hours", "!c destiny 2 tomorrow at 3pm"],
      throttling: {
        usages: 6,
        duration: 120,
      },
      args: [
        {
          key: "gaming_session_keywords",
          prompt: "Type a game and time, like: `!c Apex Legends in 5 hours`",
          type: "string",
          default: "none",
        },
      ],
    });
  }
  async run(msg, { gaming_session_keywords }) {
    console.log("STARTING CREATE SHORT");
    if (gaming_session_keywords == "none") {
      const helpEmbed = await discordApi.helpEmbed(msg, "", "");
      return msg.embed(helpEmbed);
    }
    if (!gaming_session_keywords) {
      return;
    }
    console.log("STILL IN CREATE SHORT");
    const regex = /( in | at | on )\s*(.+)/i;
    const match = regex.exec(gaming_session_keywords);
    let time = null;
    let remainder = null;
    if (match) {
      time = match[0];
      remainder = gaming_session_keywords.replace(time, "");
    }

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
      // msg.react("⚠️");
      const message = await msg.say(`Check your DM's to link your account first...`);
      // delete the message after 5 seconds
      setTimeout(() => {
        message.delete();
      }, 5000);

      return msg.author.send(notice);
    }
  }
};
