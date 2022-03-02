const { MessageEmbed } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

// listen for webhooks received from the100.io and log to console
module.exports = (client) => {
  client.on("message", async (message) => {
    try {
      if (message.webhookID) {
        console.log("WEBHOOK RECEIVED");
        console.log(message.author.username);

        // return unless the message is from the100.io
        if (message.author.username !== ("the100staging" || "The100.io" || "the100bot")) {
          console.log("NOT FROM THE100.IO");
          return;
        }

        console.log(message.content);
        // if message.content includes 'jump to' then we link to existing embed and update it
        if (message.content.includes("jump to")) {
          console.log("JUMP TO RECEIVED");
          // parse out the url in the message
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const url = message.content.match(urlRegex)[0];
          // parse out the string after the very last slash in the url
          const idRegex = /\/([^\/]+)$/;
          const id = url.match(idRegex)[1];
          // strip out ) from the id
          const idStripped = id.replace(")", "");
          console.log(idStripped);

          // find the message in the channel with the id
          const msg = await message.channel.messages.fetch(idStripped);

          // wait 2 seconds to allow the message to be fetched
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const json = await api.postReaction({
            action: "refresh_gaming_session",
            msg: msg,
            user: msg.author,
            body: {},
          });
          const { notice, gaming_session } = json;

          if (!gaming_session) {
            console.log("ERROR:");
            console.log(json.notice);
            return;
          }

          console.log("GAMING SESSION:");
          console.log(gaming_session);

          const receivedEmbed = msg.embeds[0];
          console.log("EXISTING EMBED:");
          console.log(receivedEmbed);

          const newEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
          msg.edit({ embed: newEmbed });
        } else {
          // Otherwise, we create a new embed

          // get the message's embed
          const receivedEmbed = message.embeds[0];
          if (!receivedEmbed || !receivedEmbed.url) {
            console.log("NO EMBED FOUND");
            return;
          }

          const messageContent = message.content;
          console.log("RECEIVED EMBED:");
          console.log(receivedEmbed);
          await message.delete();

          // for the string receivedEmbed.url, parse out the id
          const idRegex = /\/([^\/]+)$/;
          const id = receivedEmbed.url.match(idRegex)[1];
          if (!id) {
            console.log("NO ID FOUND");
            return;
          }
          const gamingSessionId = id.split("?")[0];
          if (!gamingSessionId) {
            console.log("NO GAMING SESSION ID FOUND");
            return;
          }

          console.log("CREATING NEW EMBED FOR GAMING SESSION: " + gamingSessionId);

          const newEmbed = await discordApi.convertEmbedToGamingSessionWithReactions(receivedEmbed);

          // post a new message with the messageContent
          const newMessage = await message.channel.send(messageContent, { embed: newEmbed });
          await newMessage.react("✅");
          await newMessage.react("📝");
          await api.postAction({
            action: "update_gaming_session",
            msg: newMessage,
            body: {
              gaming_session_id: gamingSessionId,
              embed_id: newMessage.id,
            },
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
};
