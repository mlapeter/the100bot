const { MessageEmbed } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

// listen for webhooks received from the100.io and log to console
module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    // try {
    console.log("message received");
    // console.log(message.webhookId);
    console.log(message.content);
    // return unless message.webhookId
    if (!message.webhookId) {
      return;
    }

    console.log("WEBHOOK RECEIVED");
    console.log(message.author.username);

    // return unless the message is from the100.io
    const the100botNames = ["the100bot", "the100staging", "The100.io"];
    if (!the100botNames.includes(message.author.username)) {
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

      console.log("----------------------------------------------------");
      console.log("MESSAGE FOUND:");
      console.log(msg);
      console.log(msg.content);
      console.log(msg.author.username);
      console.log(message.embeds[0]);
      console.log(msg.embeds[0]);

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

      const receivedEmbed = msg.embeds[0];
      const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
      // update the message with the new embed
      await msg.edit({ embeds: [exampleEmbed] });
      // await interaction.update({ embeds: [exampleEmbed] });

      // console.log("GAMING SESSION:");
      // console.log(gaming_session);

      // const receivedEmbed = msg.embeds[0];
      // console.log("EXISTING EMBED:");
      // console.log(receivedEmbed);

      // const newEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
      // console.log("NEW EMBED:");
      // console.log(newEmbed);
      // msg.edit({ embed: newEmbed });
      // console.log("FINAL MESSAGE:");
      // console.log(msg);
    } else {
      // Otherwise, we create a new embed

      // get the message's embed
      const receivedEmbed = message.embeds[0];
      if (!receivedEmbed || !receivedEmbed.url) {
        console.log("NO EMBED FOUND");
        return;
      } else {
        console.log("EMBED FOUND");
        console.log(receivedEmbed.url);
        console.log(receivedEmbed);
      }

      const messageContent = message.content;
      console.log("messageContent:");
      console.log(messageContent);
      console.log("RECEIVED EMBED:");
      console.log(receivedEmbed);

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

      // check if we have permission to edit embeds
      const permissions = message.channel.permissionsFor(client.user);
      if (!permissions.has("MANAGE_MESSAGES")) {
        console.log("NO MANAGE MESSAGES PERMISSION");

        // find the owner of the guild
        // const owner = await message.member.guild.owner;

        // console.log("GUILD OWNER:");
        // console.log(owner);

        const embed = new MessageEmbed()
          .setTitle("We've updated The100bot!")
          .setDescription(
            `You can now use reactions to join/leave games! But first you've got to re-add the bot from your group page with new permissions so we can edit embeds: ${url}`
          )
          .setColor("#ff0000");
        // await owner.send(embed);

        const newMessage = await message.channel.send(messageContent, { embed: embed });
      } else {
        console.log("HAS PERMISSION TO EDIT MESSAGES");

        console.log("CREATING NEW EMBED FOR GAMING SESSION: " + gamingSessionId);

        const newMessage = await discordApi.convertEmbedToGamingSessionWithReactions(
          message,
          messageContent,
          receivedEmbed,
          gamingSessionId
        );

        await message.delete();

        // post a new message with the messageContent
        // const newMessage = await message.channel.send(messageContent, { embed: newEmbed });
        // await newMessage.react("✅");
        // await newMessage.react("📝");
        await api.postAction({
          action: "update_gaming_session",
          interaction: newMessage,
          body: {
            gaming_session_id: gamingSessionId,
            embed_id: newMessage.id,
          },
        });
      }
    }

    // } catch (e) {
    //   console.log(e);
    // }
  });
};
