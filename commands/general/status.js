const { Command } = require("discord.js-commando");

module.exports = class MeowCommand extends Command {
  constructor(client) {
    super(client, {
      name: "the100status",
      aliases: ["status"],
      group: "general",
      memberName: "the100status",
      description: "Check The100bot status.",
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }
  async run(msg) {
    const message = await msg.say(
      `I'm awake! Active in: ${this.client.guilds.size} guilds.`
    );
    return message.edit(
      `I'm awake! Active in: ${this.client.guilds.size} guilds.`
    );
  }
};
