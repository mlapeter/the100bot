const { EmbedBuilder } = require("discord.js");

const SUPPORT_INVITE = "https://discord.gg/PSeRUMz";

// Sends a welcome message when the bot is first added to a server.
//
// Note: the previous version of this file also registered a `messageCreate`
// handler that tried to DM every server admin. It received the Message (not a
// Guild) as its argument, so `message.members` was undefined and it threw
// `Cannot read properties of undefined (reading 'cache')` on *every* message in
// *every* channel (see BOT-1). It has been removed: the guildCreate greeting
// below is the correct, non-spammy way to introduce the bot on join.
module.exports = (client) => {
  client.on("guildCreate", async (guild) => {
    try {
      // Post the greeting in a sensible starting channel: prefer #general, then
      // the guild's configured system channel, then the first text channel we
      // can actually send in.
      const channel =
        guild.channels.cache.find(
          (c) => c.name === "general" && c.isTextBased?.() && c.permissionsFor(client.user)?.has("SendMessages")
        ) ||
        (guild.systemChannel && guild.systemChannel.permissionsFor(client.user)?.has("SendMessages")
          ? guild.systemChannel
          : null) ||
        guild.channels.cache.find(
          (c) => c.isTextBased?.() && c.permissionsFor(client.user)?.has("SendMessages")
        );

      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Thanks for adding the100.io! 👋")
        .setDescription(
          "I help your server schedule gaming sessions right here in Discord — and your session posts get live **Join** / **Leave** buttons.\n\n" +
            "**Get started:**\n" +
            "• `/c apex legends tonight at 8pm` — quickly create a session\n" +
            "• `/create` — step-by-step session with more options\n" +
            "• `/link` — connect your the100.io account (do this once so I can post as you)\n" +
            "• `/games` — list your group's upcoming sessions\n" +
            "• `/help` — see everything I can do\n\n" +
            `Questions or something not working? Join our [support server](${SUPPORT_INVITE}).`
        )
        .setThumbnail(client.user.avatarURL());

      await channel.send({ embeds: [embed] });
    } catch (e) {
      console.log(e);
    }
  });
};
