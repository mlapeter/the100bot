const { Permissions } = require("discord.js");
const { MessageEmbed } = require("discord.js");

module.exports = (client) => {
  console.log("In Welcome.js");
  // send a welcome message when bot is first added to the server
  client.on("guildCreate", async (guild) => {
    const members = guild.members.cache.filter((member) => member.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
    console.log("MEMBERS:");
    console.log(members);

    const channel = guild.channels.cache.find((channel) => channel.name === "general");
    if (!channel) return;
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Hello from The100bot!")
      .setDescription(
        "The100bot lets you to easily schedule gaming sessions.\n\n" +
          "To get started, just type `!c test event at 8pm`, try it out!\n\n" +
          "For advanced options, type `!create`\n\n" +
          "Or for help type `!help`\n\n" +
          "If you have any questions, feel free to join the support server: https://discord.gg/dBZRVB9"
      )
      .setThumbnail(client.user.avatarURL());
    console.log("SENDING WELCOME MESSAGE TO CHANNEL");
    await channel.send(embed);
  });

  // get all the members with manage server permissions
  client.on("messageCreate", async (guild) => {
    console.log("STARTING SENDING WELCOME DM TO MANAGERS");

    // const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const members = guild.members.cache.filter((member) => member.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
    // send a direct message to each member with manage server permissions
    members.forEach(async (member) => {
      const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Welcome to The100bot!")
        .setDescription(
          "The100bot is a Discord bot that allows you to interact with The100.io.\n\n" +
            "To get started, use the `!help` command to see a list of commands.\n\n" +
            "If you have any questions, feel free to join the support server: https://discord.gg/dBZRVB9"
        )
        .setThumbnail(client.user.avatarURL())
        .setTimestamp();
      console.log("SENDING WELCOME DM TO MANAGERS");
      await member.send(embed);
    });
  });
};
