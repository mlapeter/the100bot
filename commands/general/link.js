const { Command } = require("discord.js-commando");
const Api = require('../../utils/api')
const api = new Api

module.exports = class LinkCommand extends Command {
  constructor(client) {
    super(client, {
      name: "link",
      group: "general",
      memberName: "link",
      description: "Link your Discord account to The100.io.",
      throttling: {
        usages: 4,
        duration: 120
      }
    });
  }

  run(msg) {
    console.log(msg.author)
    // const json = await api.postAction({ action: 'join_gaming_session', msg: msg, body: { message: gaming_session_id } })

    // if (json.notice.includes("You just joined")) {
    //   // msg.react("💯");
    // } else {
    //   msg.react("💩");
    // }
    // return msg.author.send(json.notice);

    console.log("LINKING")

    let content = `Click here to link your account!!: https://the100.io/linkdiscord/${encodeURIComponent(
      msg.author.id)}`;
    console.log(content);
    msg.react("💯");
    return msg.author.send(content);
  }
};
