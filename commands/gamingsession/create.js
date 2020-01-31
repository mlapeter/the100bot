const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "create",
      aliases: [],
      group: "gamingsession",
      memberName: "create",
      description: "Joins specified gaming session",
      examples: [
        "!create gambit this sunday at 3pm",
        "!create crucible control tomorrow at 5pm 'this is my awesome description'",
        "!create last wish raid 3 days from now at 5pm"
      ],
      throttling: {
        usages: 4,
        duration: 120
      },
      args: [
        {
          key: "game",
          prompt:
            "Type the game. ex 'destiny 2', 'grand theft auto 5",
          type: "string"
        },
      ]
    });
  }


  async run(msg, { game, activity, time }) {
    const emojiHash = { '1️⃣': 0, '2️⃣': 1, '3️⃣': 2, '4️⃣': 3, '5️⃣': 4, '6️⃣': 5, '7️⃣': 6, '8️⃣': 7, '9️⃣': 8 }

    let link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/find_games?guild_id=${msg.guild.id}&username=${
      msg.author.username
      }&discriminator=${
      msg.author.discriminator
      }&message=${game}`;
    let res = await fetch(link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN
      }
    });

    console.log(res.status);
    if (res.status !== 201) {
      return msg.say(
        "Not Authorized - make sure the bot creator is using the correct API Token."
      );
    }
    let json = await res.json();

    const embed0 = new RichEmbed()
      .setTitle("Select Game:")
      .setDescription(json.results.numbered_results)
      .setColor(0x00ae86);
    const gamesEmbed = await msg.embed(embed0)

    json.results.numbered_emojis.forEach(async emoji => {
      await gamesEmbed.react('1️⃣')
      gamesEmbed.react(emoji)
    });

    let selectedGame = null
    try {
      let filter = (reaction, user) => user.id === msg.author.id
      let userReactions = await gamesEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
      let reaction = userReactions.first();
      let activityIndex = emojiHash[reaction.emoji.name]

      selectedGame = json.results.string_results[activityIndex]
      console.log("selectedGame: ")
      console.logselectedGame()
    } catch (e) {
      console.log("Error:")
      console.log(e)
    }
    await gamesEmbed.delete();



    // SELECT ACTIVITY //

    const embed1 = new RichEmbed()
      .setTitle(selectedGame)
      .setDescription("What activity? ex 'last wish raid' or 'gambit'")
      .setColor(0x00ae86);
    const whichActivityEmbed = await msg.embed(embed1)

    const filter2 = m => m.author.id === msg.author.id
    const activities = await msg.channel.awaitMessages(filter2, { max: 1, time: 60000, errors: ['time'] })
    const pickedActivity = activities.first();
    console.log("pickedActivity: ")
    console.log(pickedActivity.content)


    link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/find_activities?guild_id=${msg.guild.id}&username=${
      msg.author.username
      }&discriminator=${
      msg.author.discriminator
      }&activity=${encodeURI(pickedActivity.content)}&game=${encodeURI(selectedGame)}`;
    res = await fetch(link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN
      }
    });

    console.log(res.status);
    if (res.status !== 201) {
      return msg.say(
        "Not Authorized - make sure the bot creator is using the correct API Token."
      );
    }
    json = await res.json();
    console.log(json)

    const embed = new RichEmbed()
      .setTitle("Select Activity:")
      .setDescription(json.results.numbered_results)
      .setColor(0x00ae86);
    const activitiesEmbed = await msg.embed(embed)

    json.results.numbered_emojis.forEach(async emoji => {
      await activitiesEmbed.react('1️⃣')
      activitiesEmbed.react(emoji)
    });

    let selectedActivity = null
    try {
      const filter = (reaction, user) => user.id === msg.author.id
      const userReactions = await activitiesEmbed.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
      const reaction = userReactions.first();
      const activityIndex = emojiHash[reaction.emoji.name]
      selectedActivity = json.results.numbered_results[activityIndex]
    } catch (e) {
      console.log("Error:")
      console.log(e)
    }
    await activitiesEmbed.delete();

    if (!selectedActivity) {
      return msg.say(
        "Game Creation Canceled."
      );
    }

    // SELECT TIME //
    const embed2 = new RichEmbed()
      .setTitle(selectedActivity)
      .setDescription("What time? ex 'tonight at 7pm' or '11am 2/15/20'")
      .setColor(0x00ae86);
    const timeEmbed = await msg.embed(embed2)

    // const filter2 = m => m.author.id === msg.author.id
    const startTimes = await msg.channel.awaitMessages(filter2, { max: 1, time: 60000, errors: ['time'] })
    const startTime = startTimes.first();

    await timeEmbed.delete()
    const embed3 = new RichEmbed()
      .setTitle(selectedActivity)
      .setDescription(startTime + "\n Enter description or 'none':")
      .setColor(0x00ae86);
    const descriptionEmbed = await msg.embed(embed3)

    const descriptions = await msg.channel.awaitMessages(filter2, { max: 1, time: 60000, errors: ['time'] })
    let description = descriptions.first()
    console.log("DESCRIPTION: ")
    console.log(description.content)
    description = description.content.replace("none", "")


    await descriptionEmbed.delete()
    const embed4 = new RichEmbed()
      .setTitle("Creating Gaming Session...")
      .setColor(0x00ae86);
    const loadingEmbed = await msg.embed(embed4)
    setTimeout(function () { loadingEmbed.delete() }, 2000);


    const createGameMessage = encodeURI(selectedActivity + ' "' + description + '"')
    let createGameUrl = `${
      process.env.THE100_API_BASE_URL
      }discordbots/create_gaming_session?guild_id=${msg.guild.id}&username=${
      msg.author.username
      }&discriminator=${
      msg.author.discriminator
      }&message=${createGameMessage}&time=${startTime}`;

    const createGameResponse = await fetch(createGameUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN
      }
    });
    console.log(createGameResponse.status);
    if (createGameResponse.status !== 201) {
      return msg.say(
        "Not Authorized - make sure the bot creator is using the correct API Token."
      );
    }
    const createGameJson = await createGameResponse.json();

    let gaming_sessions_list_link = `${
      process.env.THE100_API_BASE_URL
      }discordbots/list_gaming_sessions?guild_id=${msg.guild.id}`;

    if (createGameJson.notice.includes("Gaming Session Created!")) {
      const response = await fetch(gaming_sessions_list_link, {
        method: "POST"
      });
    } else {
      msg.react("💩");
    }
    return msg.author.send(createGameJson.notice);
  }

};


 // msg.embed(embed).then(async message => {
  //   await message.react('🇷')
  //   await message.react('🇨')
  //   await message.react('🇬')
  //   await message.react('🇸')
  //   await message.react('🇴')

  // if (reaction.emoji.name === '1️⃣') {
  //   await message.delete();
  //   message.say('you reacted with a 1️⃣');
  // } else {
  //   message.say('you reacted with a thumbs down.');
  // }

  // const filter = (reaction, user) => {
  //   return ['👍', '👎'].includes(reaction.emoji.name) && user.id === msg.author.id;
  // };

  // async run(msg, { gaming_session_keywords }) {
  //   console.log(msg.content);
  //   let content = `${msg.author.username}#${
  //     msg.author.discriminator
  //     } Creating Gaming Session with keywords:${gaming_session_keywords} in Guild ID: ${
  //     msg.guild.id
  //     }`;