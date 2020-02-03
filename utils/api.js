const fetch = require("node-fetch");


module.exports = class Api {
  async test(params) {
    console.log("testing")
    console.log(params)
  }

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

    let url = `${
      process.env.THE100_API_BASE_URL
      }discordbots/${action}`

    let data = {
      guild_id: msg.guild.id,
      discord_id: msg.author.id,
      username: msg.author.username,
      discriminator: msg.author.discriminator,
      ...body
    }

    const res = await this.post(url, data)

    if (res.status !== 201) {
      return msg.say(
        "Not Authorized - make sure the bot creator is using the correct API Token."
      );
    }
    return await res.json();
  }

}
