const { Command } = require("discord.js-commando");
const Api = require("../../utils/api");
const api = new Api();

module.exports = class StatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: "the100status",
      aliases: ["status"],
      group: "general",
      memberName: "the100status",
      description: "Check The100bot status.",
      throttling: {
        usages: 2,
        duration: 10,
      },
    });
  }
  async run(msg) {
    console.log("STARTING STATUS");
    const message = await msg.say(`Online!`);
    const json = await api.postAction({ action: "bot_status", msg: msg, body: {} });
    console.log(json);

    return message.edit(`Online! ${json.text ? json.text : ""}`);
  }
};
