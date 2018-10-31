const { Command } = require("discord.js-commando");

module.exports = class MeowCommand extends Command {
  constructor(client) {
    super(client, {
      name: "the100status",
      aliases: ["status"],
      group: "general",
      memberName: "the100status",
      description: "Replies with a meow, kitty cat."
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
