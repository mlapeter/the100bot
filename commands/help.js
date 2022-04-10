const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Get help using The100Bot"),
  async execute(interaction) {
    console.log("STARTING HELP");

    await interaction.reply("Help:");

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
          name: "/c",
          value:
            "Quickly create simple events\n >>> `!c apex legends at 8pm` \n `!c destiny 2 next thursday at 8pm` \n `!c among us in 1 hour`",
        },
        { name: "/create", value: "Create advanced gaming sessions\n >>> `!create`" },
        { name: "/link", value: "Link your account to The100.io\n >>> `!link`" }
        // { name: "!vote", value: "Vote for The100bot on top.gg, earn supporter points!" }
      );
    return await interaction.channel.send({ embeds: [embed] });
  },
};
