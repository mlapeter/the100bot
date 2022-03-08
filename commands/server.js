const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("server").setDescription("Display info about this server."),
  async execute(interaction) {
    let embedPoll = new MessageEmbed()
      .setTitle("😲 DaSquad 😲")
      .setColor("YELLOW")
      .addField("1:", "name")
      .addField("2:", "name2")
      .addField("3:", "name3")
      .addField("4:", "name4")
      .addField("5:", "name5")
      .addField("6:", "name6")
      .addField("7:", "name7")
      .addField("8:", "name8");

    let reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
    let msgEmbed = await interaction.channel.send({ embeds: [embedPoll] });

    reactions.forEach((reaction) => msgEmbed.react(reaction));

    const filter = (reaction) => reactions.includes(reaction.emoji.name);
    const collector = msgEmbed.createReactionCollector({ filter });

    // code inside this runs every time someone reacts with those emojis
    collector.on("collect", (reaction, user) => {
      console.log(`Just collected a ${reaction.emoji.name} reaction from ${user.username}`);
    });

    // return interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
  },
};
