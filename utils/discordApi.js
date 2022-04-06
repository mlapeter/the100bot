const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
// const { Discord } = require('discord.js');
const Api = require("./api");
const api = new Api();

module.exports = class DiscordApi {
  async getTextResponse(interaction) {
    const msg_filter = (m) => m.author.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessages({ filter: msg_filter, max: 1 });
    console.log("collected: ");
    console.log(collected.first().content);
    return collected.first().content;
  }

  getItemFromReaction(reaction, items) {
    const reactionHash = {
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

    let activityIndex = reactionHash[reaction.emoji.name];
    const selected = items[activityIndex];
    console.log("getItemFromReaction RESPONSE: ");
    console.log(selected);
    return selected;
  }

  async getEmojiResponse(interaction, embed, reactions, items) {
    console.log("START getEmojiResponse");
    let selected = null;

    const filter = (reaction) => reactions.includes(reaction.emoji.name);
    const collector = embed.createReactionCollector({ filter });

    // create a promise that resolves when the user selects a game
    const selectedGamePromise = new Promise((resolve, reject) => {
      collector.on("collect", (reaction, user) => {
        if (user.id == interaction.user.id) {
          selected = this.getItemFromReaction(reaction, items);
          resolve(reaction.emoji.name);
        }
      });
    });
    await selectedGamePromise;
    console.log("getEmojiResponse RESULT");
    console.log(selected);
    return selected;
  }

  async embedText(interaction, title, description) {
    console.log("EMBED TEXT DESCRIPTION");
    console.log(description);
    // check if description is an array and convert to string
    if (description instanceof Array) {
      console.log("ARRAY DETECTED");
      let numbered_results_string = "";
      for (let i = 0; i < description.length; i++) {
        numbered_results_string += description[i] + "\n";
      }
      description = numbered_results_string;
    }
    console.log(description);

    const embed = new MessageEmbed().setTitle(title).setDescription(description.toString()).setColor(0x00ae86);
    return await interaction.channel.send({ embeds: [embed] });
  }

  async helpEmbed(msg, title, description) {
    let url = `${process.env.THE100_BASE_URL}gaming_sessions/new`;

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

  async embedTextAndEmojis(interaction, title, description, emojis) {
    const embed = await this.embedText(interaction, title, description);
    emojis.forEach(async (emoji) => {
      try {
        // await embed.react("1️⃣");
        await embed.react(emoji);
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

  async embedGamingSession(interaction, gaming_session) {
    const embed = new MessageEmbed()
      .setTitle(gaming_session.title)
      .setURL(gaming_session.url)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color);
    console.log("EMBED:");
    console.log(embed);
    return await interaction.channel.send({ embeds: [embed] });
  }

  async embedGamingSessionWithReactions(interaction, gaming_session) {
    console.log("In embedGamingSessionWithReactions");
    console.log(interaction);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("join-" + gaming_session.id.toString())
        .setLabel("Join")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("leave-" + gaming_session.id.toString())
        .setLabel("Leave")
        .setStyle("SECONDARY")
    );

    const embed = new MessageEmbed()
      .setTitle(":calendar_spiral: " + gaming_session.title)
      .setURL(gaming_session.url)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color);
    // .setFooter("✅ Join | 📝 Edit | Created by " + msg.author.username);
    const finishedEmbed = await interaction.channel.send({ embeds: [embed], components: [row] });

    // const finishedEmbed = await interaction.reply({ embeds: [embed], components: [row] });

    // await finishedEmbed.react("✅");
    // await finishedEmbed.react("📝");

    await api.postAction({
      action: "update_gaming_session",
      interaction: interaction,
      body: {
        gaming_session_id: gaming_session.id,
        embed_id: finishedEmbed.id,
      },
    });

    return;
  }

  async convertEmbedToGamingSessionWithReactions(message, messageContent, embed, gamingSessionId) {
    console.log("In convertEmbedToGamingSessionWithReactions");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("join-" + gamingSessionId.toString())
        .setLabel("Join")
        .setStyle("PRIMARY"),
      new MessageButton()
        .setCustomId("leave-" + gamingSessionId.toString())
        .setLabel("Leave")
        .setStyle("SECONDARY")
    );

    const newEmbed = new MessageEmbed()
      .setTitle(":calendar_spiral: " + embed.title)
      .setURL(embed.url)
      .setDescription(embed.description)
      .setColor(embed.color);
    // .setFooter("✅ Join | 📝 Edit");
    // const finishedEmbed = await msg.embed(newEmbed);
    // return newEmbed;

    const finishedEmbed = await message.channel.send({
      content: messageContent ? messageContent : "TESTING",
      embeds: [newEmbed],
      components: [row],
    });
    return finishedEmbed;
  }

  async embedGamingSessionDynamic(gaming_session, receivedEmbed = null) {
    console.log("----------------------------------");
    console.log("In embedGamingSessionDynamic");
    console.log(receivedEmbed);
    console.log("gaming_session in embedGamingSessionDynamic: ");
    console.log(gaming_session);
    const embed = new MessageEmbed(receivedEmbed)
      .setTitle(":calendar_spiral: " + gaming_session.title)
      .setURL(gaming_session.url)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color);
    // .setFooter("✅ Join | 📝 Edit | Created by " + user.username);
    console.log("embed created in embedGamingSessionDynamic: ");
    console.log(embed);
    return embed;
  }
};

// http://www.google.com/calendar/event?action=TEMPLATE&text=destiny%202&dates=20220219T191509Z/20220219T201509Z&details=&location=

// determine user's timezone
// https://sesh.fyi/tz?id=efZBrAHVQW9bkxhdsLsXmf&target=user
