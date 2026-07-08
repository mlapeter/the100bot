const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Api = require("./api");
const api = new Api();

// EmbedBuilder (v14) is stricter than the old MessageEmbed: setters reject
// empty / null values. These helpers apply a setter only when the value is
// present so we don't crash on optional fields coming back from the API.
const setIfPresent = (embed, method, value) => {
  if (value !== undefined && value !== null && value !== "") {
    embed[method](value);
  }
  return embed;
};

module.exports = class DiscordApi {
  async getTextResponse(interaction) {
    const msg_filter = (m) => m.author.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessages({ filter: msg_filter, max: 1 });
    const response = collected.first().content;
    console.log("collected: ");
    console.log(response);
    try {
      collected.first().delete();
    } catch (e) {
      console.log("ERROR DELETING MESSAGE");
      console.log(e);
    }
    return response;
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

    const embed = new EmbedBuilder().setColor(0x00ae86);
    setIfPresent(embed, "setTitle", title);
    setIfPresent(embed, "setDescription", description ? description.toString() : null);
    return await interaction.followUp({ embeds: [embed] });
  }

  async helpEmbed(msg, title, description) {
    const url = `${process.env.THE100_BASE_URL}gaming_sessions/new`;

    const embed = new EmbedBuilder()
      .setTitle("Create Events")
      .setColor(0x00ae86)
      .addFields(
        {
          name: "Create simple events in Discord",
          value: "`/c Apex Legends in 5 hours`",
        },
        {
          name: "Create gaming sessions in Discord",
          value: "`/create`",
        },
        {
          name: "Create events using Web Interface",
          value: `[Click to open create page](${url})`,
        }
      );
    return embed;
  }

  async embedTextAndEmojis(interaction, title, description, emojis) {
    const embed = await this.embedText(interaction, title, description);

    emojis.forEach(async (emoji) => {
      try {
        await embed.react(emoji);
      } catch (e) {
        console.log("Emoji error: ");
        console.log(e);
      }
    });

    return embed;
  }

  async embedGamingSession(interaction, gaming_session) {
    try {
      const embed = new EmbedBuilder();
      setIfPresent(embed, "setTitle", gaming_session.title);
      setIfPresent(embed, "setURL", gaming_session.url);
      setIfPresent(embed, "setDescription", gaming_session.description);
      setIfPresent(embed, "setColor", gaming_session.color);
      console.log("EMBED:");
      console.log(embed);
      return await interaction.channel.send({ embeds: [embed] });
    } catch (e) {
      console.log(e);
    }
  }

  buildJoinLeaveRow(gamingSessionId) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("join-" + gamingSessionId.toString())
        .setLabel("Join")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("leave-" + gamingSessionId.toString())
        .setLabel("Leave")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  async embedGamingSessionWithReactions(interaction, gaming_session) {
    try {
      console.log("In embedGamingSessionWithReactions");

      const row = this.buildJoinLeaveRow(gaming_session.id);

      const embed = new EmbedBuilder();
      setIfPresent(embed, "setTitle", ":calendar_spiral: " + gaming_session.title);
      setIfPresent(embed, "setURL", gaming_session.url);
      setIfPresent(embed, "setDescription", gaming_session.description);
      setIfPresent(embed, "setColor", gaming_session.color);
      const finishedEmbed = await interaction.channel.send({ embeds: [embed], components: [row] });

      await api.postAction({
        action: "update_gaming_session",
        interaction: interaction,
        body: {
          gaming_session_id: gaming_session.id,
          embed_id: finishedEmbed.id,
          channel_id: interaction.channel.id,
        },
      });

      return;
    } catch (e) {
      console.log(e);
    }
  }

  async convertEmbedToGamingSessionWithReactions(message, messageContent, embed, gamingSessionId) {
    try {
      console.log("In convertEmbedToGamingSessionWithReactions");

      const row = this.buildJoinLeaveRow(gamingSessionId);

      const newEmbed = new EmbedBuilder();
      setIfPresent(newEmbed, "setTitle", ":calendar_spiral: " + embed.title);
      setIfPresent(newEmbed, "setURL", embed.url);
      setIfPresent(newEmbed, "setDescription", embed.description);
      setIfPresent(newEmbed, "setColor", embed.color);

      const finishedEmbed = await message.channel.send({
        content: messageContent ? messageContent : "",
        embeds: [newEmbed],
        components: [row],
      });
      return finishedEmbed;
    } catch (e) {
      console.log(e);
    }
  }

  async embedGamingSessionDynamic(gaming_session, receivedEmbed = null) {
    try {
      const embed = receivedEmbed ? EmbedBuilder.from(receivedEmbed) : new EmbedBuilder();
      setIfPresent(embed, "setTitle", ":calendar_spiral: " + gaming_session.title);
      setIfPresent(embed, "setURL", gaming_session.url);
      setIfPresent(embed, "setDescription", gaming_session.description);
      setIfPresent(embed, "setColor", gaming_session.color);
      console.log("embed created in embedGamingSessionDynamic: ");
      console.log(embed);
      return embed;
    } catch (e) {
      console.log(e);
    }
  }
};
