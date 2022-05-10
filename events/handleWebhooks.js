const { MessageEmbed } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

// listen for webhooks received from the100.io and log to console
module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (!message.webhookId || message.type !== "DEFAULT") {
        return;
      }

      console.log("WEBHOOK RECEIVED");
      // console.log(message);

      // return unless the message is from the100.io
      const the100botNames = ["the100bot", "the100staging", "The100.io"];
      if (!the100botNames.includes(message.author.username)) {
        return;
      }

      console.log(message);

      // console.log(message);
      // return if message does not need an embed with buttons

      // return if message has an embed with a title that contains "new group menber"
      if (message.embeds.length > 0) {
        const embed = message.embeds[0];
        if (
          embed.title &&
          (embed.title.toLowerCase().includes("new group member") ||
            embed.title.toLowerCase().includes("new membership request"))
        ) {
          console.log("REGULAR MESSAGE NO EMBED NEEDED, SKIPPING");
          return;
        }
      }

      // if message.content includes 'jump to' then we link to existing embed and update it
      if (message.content.includes("jump to") || message.content.includes("deleted")) {
        console.log("JUMP TO RECEIVED");
        // parse out the url in the message
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const url = message.content.match(urlRegex)[0];
        // parse out the string after the very last slash in the url
        const idRegex = /\/([^\/]+)$/;
        const messageId = url.match(idRegex)[1];
        const idStripped = messageId.replace(")", "");
        console.log(idStripped);

        // parse out the string between the second to last slash and last slash in the url
        const embedIdRegex = /\/([^\/]+)\/([^\/]+)$/;
        const channelId = url.match(embedIdRegex)[1];
        console.log("channelIdStripped: ");
        console.log(channelId);

        // find the message in the guild with the id or return if not found
        const guild = client.guilds.cache.find((guild) => guild.id === message.guildId);
        const channel = guild.channels.cache.find((channel) => channel.id === channelId);
        const existingEmbedMessage = await channel.messages.fetch(idStripped);
        console.log("EXISTING EMBED MESSAGE:");
        console.log(existingEmbedMessage);

        // find the message in the channel with the id or return if not found
        if (!existingEmbedMessage) {
          return;
        }
        const existingEmbed = existingEmbedMessage.embeds[0];

        console.log("MESSAGE FOUND:");
        console.log(existingEmbedMessage.content);

        // wait 2 seconds to allow the message to be fetched then refesh gaming session
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const json = await api.postReaction({
          action: "refresh_gaming_session",
          msg: existingEmbedMessage,
          user: existingEmbedMessage.author,
          body: {},
        });
        const { notice, gaming_session } = json;

        if (!gaming_session) {
          console.log("NO GAMING SESSION FOUND");
          // await existingEmbedMessage.delete();

          return;
        } else {
          console.log("GAMING SESSION FOUND");
          console.log(gaming_session);
          console.log(notice);
        }

        // update the message with the new embed
        const newEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, existingEmbed);
        await existingEmbedMessage.edit({ embeds: [newEmbed] });
      } else {
        // Otherwise, we create a new embed

        // get the message's embed
        const existingEmbed = message.embeds[0];
        if (!existingEmbed || !existingEmbed.url) {
          console.log("NO EMBED FOUND");
          return;
        }

        // for the string existingEmbed.url, parse out the id
        const idRegex = /\/([^\/]+)$/;
        const idMatch = existingEmbed?.url?.match(idRegex);
        const id = idMatch && idMatch[1];
        if (!id) {
          console.log("NO ID FOUND");
          return;
        }
        const gamingSessionId = id.split("?")[0];
        if (!gamingSessionId) {
          console.log("NO GAMING SESSION ID FOUND");
          return;
        }

        // check if we have permission to edit embeds
        const permissions = message.channel.permissionsFor(client.user);
        if (!permissions.has("MANAGE_MESSAGES")) {
          console.log("NO MANAGE MESSAGES PERMISSION");

          const embed = new MessageEmbed()
            .setTitle("We've updated The100bot!")
            .setDescription(
              `You can now use buttons to join/leave games! But first you've got to re-add the bot from your group page with new permissions so we can edit embeds: https://www.the100.io`
            )
            .setColor("#ff0000");

          await message.channel.send(message.content, { embed: embed });
        } else {
          console.log("HAS EDIT PERMISSION, CREATING NEW EMBED FOR GAMING SESSION: " + gamingSessionId);

          const newEmbed = await discordApi.convertEmbedToGamingSessionWithReactions(
            message,
            message.content,
            existingEmbed,
            gamingSessionId
          );

          await message.delete();

          await api.postAction({
            action: "update_gaming_session",
            interaction: newEmbed,
            body: {
              gaming_session_id: gamingSessionId,
              embed_id: newEmbed.id,
            },
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
};
