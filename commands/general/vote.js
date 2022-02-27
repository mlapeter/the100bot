const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");

module.exports = class LinkCommand extends Command {
  constructor(client) {
    super(client, {
      name: "vote",
      group: "general",
      memberName: "vote",
      description: "Vote for The100bot on top.gg!.",
      throttling: {
        usages: 4,
        duration: 120,
      },
    });
  }

  run(msg) {
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Vote for The100bot!")
      .setDescription("Thanks for helping spread the word!")
      .addFields({
        name: "Vote",
        value: "[Click here to Vote!](https://top.gg/bot/289824761507479555/vote)",
      })
      .setFooter("Tip: You can vote once every 12 hours.");
    msg.channel.send(embed);
  }
};
