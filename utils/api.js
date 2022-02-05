const { RichEmbed } = require("discord.js");
// const fetch = require("node-fetch");
// import fetch from 'node-fetch'

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));



module.exports = class Api {

  async post(url, data) {
    console.log("LINK: ")
    console.log(url)
    console.log(data)
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.THE100_API_TOKEN
      },
      body: JSON.stringify(data)
    });
    return res
  }

  async postAction({ action, msg, body }) {
    console.log("postAction: ")
    console.log(action)

    let url = `${process.env.THE100_API_BASE_URL
      }discordbots/${action}`

    let data = {
      guild_id: msg.guild.id,
      discord_id: msg.author.id,
      username: msg.author.username,
      discriminator: msg.author.discriminator,
      ...body
    }

    const res = await this.post(url, data)
    if (res.status == 404) {
      return msg.say(
        "Error: No The100.io group found. Go to <https://www.the100.io> to re-add this bot from your group page."
      );
    } else if (res.status !== 201) {
      return msg.say(
        "Error: Contact Us at: <https://www.the100.io/help> or: <https://discord.gg/FTDeeXA> for help."
      );
    }
    return await res.json();
  }

}
