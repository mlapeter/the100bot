const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  console.log("In Welcome.js");
  // send a welcome message when bot is first added to the server
  client.on("guildCreate", async (guild) => {
    try {
      const members = guild.members.cache.filter((member) =>
        member.permissions.has(PermissionsBitField.Flags.Administrator)
      );
      console.log("MEMBERS:");
      console.log(members);

      const channel = guild.channels.cache.find((channel) => channel.name === "general");
      if (!channel) return;
      const embed = new EmbedBuilder()
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
      await channel.send({ embeds: [embed] });
    } catch (e) {
      console.log(e);
    }
  });

  // get all the members with manage server permissions
  //
  // BOT-1 root cause: this handler was wired to the "messageCreate" event
  // while treating its callback argument as a Guild (naming it `guild` and
  // calling `guild.members.cache`, copy-pasted from the guildCreate handler
  // above). messageCreate's argument is a Message, which has no `.members`
  // property at all -- so `guild.members` was always undefined and
  // `.cache` threw "Cannot read properties of undefined (reading 'cache')"
  // on literally every message the bot could see, including DMs (which
  // also have no `.guild`). See DISCORD_BOT_ENGAGEMENT_PLAN.md BOT-1.
  //
  // Fix: this is clearly a "DM the admins when the bot joins a server"
  // flow (matches the comment and the sibling handler above it), so it
  // belongs on guildCreate, not on every message. That also removes an
  // unintentional spam vector the crash had been accidentally masking
  // (DMing every server admin on every single chat message). A defensive
  // guard is kept in case a partial/unavailable guild object ever reaches
  // here without a populated members cache.
  client.on("guildCreate", async (guild) => {
    try {
      console.log("STARTING SENDING WELCOME DM TO MANAGERS");

      if (!guild?.members?.cache) return;

      const members = guild.members.cache.filter((member) =>
        member.permissions.has(PermissionsBitField.Flags.Administrator)
      );
      // send a direct message to each member with manage server permissions
      members.forEach(async (member) => {
        const embed = new EmbedBuilder()
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
        try {
          await member.send({ embeds: [embed] });
        } catch (e) {
          // Member has DMs closed / blocked the bot -- not fatal, don't let
          // one rejection inside this forEach take down the rest.
          console.log("WELCOME DM ERROR (member likely has DMs closed): ");
          console.log(e);
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
};
