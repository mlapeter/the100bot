const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("See what the100.io bot can do."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("the100.io bot — quick guide")
      .setDescription(
        "I help your server schedule gaming sessions without leaving Discord. Session posts get live **Join** / **Leave** buttons.\n" +
          "[Visit the100.io](https://www.the100.io) · [Support server](https://discord.gg/PSeRUMz)"
      )
      .addFields(
        {
          name: "/link",
          value: "Connect your the100.io account (do this once so I can post and join sessions as you).",
        },
        {
          name: "/c",
          value:
            "Quickly create a session.\n>>> `/c apex legends tonight at 8pm`\n`/c destiny 2 next thursday at 8pm`\n`/c among us in 1 hour`",
        },
        { name: "/create", value: "Create a session step-by-step with more options (game, activity, platform...)." },
        { name: "/games", value: "List your group's upcoming sessions." },
        { name: "/join · /leave", value: "Join or leave a session by ID — or just use the buttons on the post." },
        { name: "/the100status", value: "Check that the bot and your group's webhook are connected." }
      )
      .setFooter({ text: "Not linked yet? Start with /link." });

    return await interaction.reply({ embeds: [embed] });
  },
};
