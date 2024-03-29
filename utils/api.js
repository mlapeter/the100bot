const { RichEmbed } = require("discord.js");
// const fetch = require("node-fetch");
// import fetch from 'node-fetch'

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = class Api {
  async post(url, data) {
    console.log("LINK: ");
    console.log(url);
    console.log(data);
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN,
      },
      body: JSON.stringify(data),
    });
    return res;
  }

  async postAction({ action, interaction, body }) {
    console.log("postAction: ");
    console.log(action);
    console.log("------------------------------------");
    console.log(interaction.channelId);

    // console.log(interaction);

    let url = `${process.env.THE100_API_BASE_URL}discordbots/${action}`;

    let data = {
      guild_id: interaction.guildId,
      channel_id: interaction.channelId,
      discord_id: interaction.user ? interaction.user.id : interaction.author.id,
      username: interaction.user ? interaction.user.username : interaction.author.username,
      discriminator: interaction.user ? interaction.user.discriminator : interaction.author.discriminator,
      ...body,
    };

    const res = await this.post(url, data);
    if (res.status == 404 || res.status == 401) {
      return interaction.reply(
        "Error: No The100.io group found. Go to <https://www.the100.io/groups/new> to re-add this bot from your group page."
      );
    } else if (res.status !== 201) {
      return interaction.reply(
        "Error: Contact Us at: <https://www.the100.io/help> or: <https://discord.gg/FTDeeXA> for help."
      );
    }
    return await res.json();
  }

  async postReaction({ action, msg, user, body }) {
    console.log("postAction: ");
    console.log(action);
    console.log("channel");
    console.log(msg.channel.id);
    const url = `${process.env.THE100_API_BASE_URL}discordbots/${action}`;

    const data = {
      guild_id: msg.guild.id,
      channel_id: msg.channel.id,
      discord_id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      message_id: msg.id,
      ...body,
    };

    console.log("BODY:");
    console.log(data);

    const res = await this.post(url, data);
    if (res.status == 404) {
      return msg.channel.send({
        content:
          "Error: No The100.io group found. Go to <https://www.the100.io> to re-add this bot from your group page.",
        ephemeral: true,
      });
    } else if (res.status !== 201) {
      return msg.channel.send({
        content: "Error: Contact Us at: <https://www.the100.io/help> or: <https://discord.gg/FTDeeXA> for help.",
        ephemeral: true,
      });
    }
    return await res.json();
  }
};
