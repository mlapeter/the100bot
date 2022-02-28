const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");

module.exports = class LinkCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      group: "general",
      memberName: "help",
      description: "Get help on how to use The100bot.",
      throttling: {
        usages: 4,
        duration: 120,
      },
    });
  }

  run(msg) {
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Hello from The100bot!")
      .setDescription(
        "The100bot lets you to easily schedule gaming sessions.\n" +
          "Vist us at [The100.io](https://www.The100.io)\n" +
          "Join our [support discord](https://discord.gg/EFRQxvUGM6)\n" +
          "Use [Web Interface](https://www.The100.io/gaming_sessions/new)"
      )
      .addFields(
        {
          name: "!c",
          value:
            "Quickly create simple events\n >>> `!c apex legends at 8pm` \n `!c destiny 2 next thursday at 8pm` \n `!c among us in 1 hour`",
        },
        { name: "!create", value: "Create advanced gaming sessions\n >>> `!create`" },
        { name: "!link", value: "Link your account to The100.io\n >>> `!link`" },
        { name: "!prefix", value: "Change the prefix for bot commands\n >>> `!prefix $`" }

        // { name: "!vote", value: "Vote for The100bot on top.gg, earn supporter points!" }
      );
    msg.channel.send(embed);
  }
};
