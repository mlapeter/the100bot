const { Command } = require("discord.js-commando");

module.exports = class MeowCommand extends Command {
  constructor(client) {
    super(client, {
      name: "the100count",
      aliases: ["the100count"],
      group: "general",
      memberName: "the100count",
      description: "Check The100bot server count.",
      ownerOnly: true,
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }
  async run(msg) {
    await msg.say(
      `Online in ${this.client.guilds.size} servers!`
    );


  }
};
