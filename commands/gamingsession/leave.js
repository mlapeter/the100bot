const { Command } = require("discord.js-commando");
const Api = require("../../utils/api");
const api = new Api();

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
        duration: 120,
      },
      args: [
        {
          key: "gaming_session_id",
          prompt: "What game would you like to leave? Enter the gaming session id:",
          type: "string",
        },
      ],
    });
  }
  async run(msg, { gaming_session_id }) {
    const json = await api.postAction({
      action: "leave_gaming_session",
      msg: msg,
      body: { message: gaming_session_id },
    });

    if (json.notice.includes("Game left")) {
      msg.react("💯");
    } else {
      msg.react("💩");
      return msg.author.send(json.notice);
    }
  }
};
