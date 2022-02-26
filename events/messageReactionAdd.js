const { Permissions } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = (client) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    // return if the user is the bot
    if (user.bot) return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        // Return as `reaction.message.author` may be undefined/null
        return;
      }
    }

    // Now the message has been cached and is fully available
    console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
    // The reaction is now also fully available and the properties will be reflected accurately:
    console.log(reaction.emoji.name);
    console.log(reaction.message.id);
    console.log(user.username);
    console.log(user.id);

    if (reaction.emoji.name === "✅") {
      console.log("user joining game");
      const json = await api.postReaction({
        action: "join_gaming_session",
        msg: reaction.message,
        user: user,
        body: {},
      });
      console.log(json);
      const { notice, gaming_session } = json;

      console.log("NOTICE:");
      console.log(notice);

      if (!notice) {
        console.log("ERROR in messageReactionAdd");
      }

      if (!gaming_session) {
        // remove the reaction
        reaction.users.remove(user);
        return user.send(json.notice);
      }

      console.log("GAMING SESSION:");
      console.log(gaming_session);

      const receivedEmbed = reaction.message.embeds[0];
      const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
      reaction.message.edit({ embed: exampleEmbed });
    }
    // need to handle errors by displaying notice to user

    if (reaction.emoji.name === "📝") {
      console.log("user editing game");

      let content = `The event creator or group admin can edit it here: <http://localhost:3000/gaming_sessions/${reaction.message.id}/edit>`;

      console.log("message.author.id");
      console.log(reaction.message.author.id);
      console.log(reaction.message.author.username);
      console.log("user.id");
      console.log(user.id);
      console.log(user.username);

      // get the permissions of the user who reacted to the message
      const member = reaction.message.guild.members.cache.get(user.id);

      console.log("PERMISSIONS:");
      console.log(member.permissions);
      console.log(member.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
      console.log(Permissions.FLAGS);

      // if (
      //   reaction.message.author.id === user.id ||
      //   member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
      // ) {
      //   content = `Click here to edit the gaming session: <http://localhost:3000/gaming_sessions/${reaction.message.id}/edit>`;
      // }

      // remove the reaction (need more user permissions first)
      // reaction.message.reactions.cache.get("📝").remove();

      return user.send(content);
    }
  });
};
