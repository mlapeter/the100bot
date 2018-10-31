const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");

module.exports = class MeowCommand extends Command {
  constructor(client) {
    super(client, {
      name: "meow",
      aliases: ["kitty-cat"],
      group: "general",
      memberName: "meow",
      description: "Replies with a meow, kitty cat.",
      examples: ["say hello!"],
      args: [
        {
          key: "text",
          prompt: "What text would you like the bot to meow?",
          type: "string"
        }
      ]
    });
  }
  run(msg, { text }) {
    msg.delete();

    const embed = new RichEmbed()
      .setDescription(`Meow ${text}`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL)
      .setColor(0x00ae86)
      .setTimestamp();
    return msg.embed(embed);
  }
};
