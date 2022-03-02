const { MessageEmbed } = require("discord.js");
// const { Discord } = require('discord.js');
const Api = require("./api");
const api = new Api();

module.exports = class DiscordApi {
  async getTextResponse(msg) {
    try {
      const filter = (m) => m.author.id === msg.author.id;
      const responses = await msg.channel.awaitMessages(filter, {
        max: 1,
        time: 45000,
        errors: ["time"],
      });
      const response = responses.first().content;
      if (response && response == "cancel") {
        return false;
      }
      return response;
    } catch (e) {
      console.log("getTextResponse error:");
      console.log(e);
      return false;
    }
  }

  async getEmojiResponse(msg, embed, results) {
    try {
      console.log("getEmojiResponse");
      const emojiHash = {
        "1️⃣": 0,
        "2️⃣": 1,
        "3️⃣": 2,
        "4️⃣": 3,
        "5️⃣": 4,
        "6️⃣": 5,
        "7️⃣": 6,
        "8️⃣": 7,
        "9️⃣": 8,
      };

      let filter = (reaction, user) => user.id === msg.author.id;
      let userReactions = await embed.awaitReactions(filter, {
        max: 1,
        time: 45000,
        errors: ["time"],
      });
      console.log("userReactions: ");
      console.log(userReactions);

      let reaction = userReactions.first();
      let activityIndex = emojiHash[reaction.emoji.name];
      console.log("getEmojiResponse: ");
      console.log(activityIndex);
      console.log(results);
      console.log(results[activityIndex]);
      const selected = results[activityIndex];
      return selected;
    } catch (e) {
      console.log("getEmojiResponse error:");
      console.log(e);
      return false;
    }
  }

  async embedText(msg, title, description) {
    const embed = new MessageEmbed().setTitle(title).setDescription(description).setColor(0x00ae86);
    return await msg.embed(embed);
  }

  async helpEmbed(msg, title, description) {
    let url = `${process.env.THE100_API_BASE_URL}gaming_sessions/new`;

    const embed = new MessageEmbed()
      .setTitle("Create Event")
      // .setDescription("Create Event")
      .setColor(0x00ae86)
      .addFields(
        {
          name: "Create events in Discord",
          value: "`!c Apex Legends in 5 hours`",
        },
        {
          name: "Create events using Web Interface",
          value: `[Click to open create page](${url})`,
        }
      );
    // return await msg.embed(embed1);
    return embed;
  }

  // find all users

  async embedTextAndEmojis(msg, title, description, emojis) {
    const embed = await this.embedText(msg, title, description);
    emojis.forEach(async (emoji) => {
      try {
        // await embed.react("1️⃣");
        await embed.react(emoji);
        console.log(emoji);
      } catch (e) {
        console.log("Emoji error: ");
        console.log(e);
      }
    });

    return embed;

    // try {
    //   return embed
    // } catch (e) {
    //   console.log(e)
    // }
  }

  async embedGamingSession(msg, gaming_session) {
    const embed = new MessageEmbed()
      .setTitle(gaming_session.title)
      .setURL(gaming_session.url)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color);
    return await msg.embed(embed);
  }

  async embedGamingSessionWithReactions(msg, gaming_session) {
    const embed = new MessageEmbed()
      .setTitle(":calendar_spiral: " + gaming_session.title)
      .setURL(gaming_session.url)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color)
      .setFooter("✅ Join | 📝 Edit | Created by " + msg.author.username);
    const finishedEmbed = await msg.embed(embed);

    await finishedEmbed.react("✅");
    await finishedEmbed.react("📝");

    await api.postAction({
      action: "update_gaming_session",
      msg: msg,
      body: {
        gaming_session_id: gaming_session.id,
        embed_id: finishedEmbed.id,
      },
    });

    return;
  }

  async convertEmbedToGamingSessionWithReactions(embed) {
    const newEmbed = new MessageEmbed()
      .setTitle(":calendar_spiral: " + embed.title)
      .setURL(embed.url)
      .setDescription(embed.description)
      .setColor(embed.color)
      .setFooter("✅ Join | 📝 Edit");
    // const finishedEmbed = await msg.embed(newEmbed);
    return newEmbed;
  }

  async embedGamingSessionDynamic(gaming_session, receivedEmbed = null) {
    console.log("----------------------------------");
    console.log("gaming_session in embedGamingSessionDynamic: ");
    console.log(gaming_session);
    const embed = new MessageEmbed(receivedEmbed)
      .setTitle(":calendar_spiral: " + gaming_session.title)
      .setURL(gaming_session.url)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color);
    // .setFooter("✅ Join | 📝 Edit | Created by " + user.username);
    console.log("embed created in embedGamingSessionDynamic: ");
    return embed;
  }
};

// http://www.google.com/calendar/event?action=TEMPLATE&text=destiny%202&dates=20220219T191509Z/20220219T201509Z&details=&location=

// determine user's timezone
// https://sesh.fyi/tz?id=efZBrAHVQW9bkxhdsLsXmf&target=user
