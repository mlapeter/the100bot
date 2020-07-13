const { RichEmbed } = require("discord.js");


module.exports = class DiscordApi {

  async getTextResponse(msg) {
    try {
      const filter = m => m.author.id === msg.author.id
      const responses = await msg.channel.awaitMessages(filter, { max: 1, time: 45000, errors: ['time'] })
      const response = responses.first().content;
      if (response && response == "cancel") { return false }
      return response
    } catch (e) {
      console.log("getTextResponse error:")
      console.log(e)
      return false
    }
  }

  async getEmojiResponse(msg, embed, results) {
    try {
      console.log("getEmojiResponse")
      const emojiHash = { '1️⃣': 0, '2️⃣': 1, '3️⃣': 2, '4️⃣': 3, '5️⃣': 4, '6️⃣': 5, '7️⃣': 6, '8️⃣': 7, '9️⃣': 8 }

      let filter = (reaction, user) => user.id === msg.author.id
      let userReactions = await embed.awaitReactions(filter, { max: 1, time: 45000, errors: ['time'] })
      console.log("userReactions: ")
      console.log(userReactions)

      let reaction = userReactions.first();
      let activityIndex = emojiHash[reaction.emoji.name]
      console.log("getEmojiResponse: ")
      console.log(activityIndex)
      console.log(results)
      console.log(results[activityIndex])
      const selected = results[activityIndex]
      return selected

    } catch (e) {
      console.log("getEmojiResponse error:")
      console.log(e)
      return false
    }
  }

  async embedText(msg, title, description) {
    const embed = new RichEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x00ae86);
    return await msg.embed(embed)
  }


  async embedTextAndEmojis(msg, title, description, emojis) {
    const embed = await this.embedText(msg, title, description)
    emojis.forEach(async emoji => {
      try {
        await embed.react('1️⃣')
        embed.react(emoji)
        console.log(emoji)
      } catch (e) {
        console.log("Emoji error: ")
        console.log(e)
      }
    });

    return embed
  }

  async embedGamingSession(msg, gaming_session) {
    const embed = new RichEmbed()
      .setTitle(gaming_session.title)
      .setURL(gaming_session.title_link)
      .setDescription(gaming_session.description)
      .setColor(gaming_session.color);
    return await msg.embed(embed);
  }
}