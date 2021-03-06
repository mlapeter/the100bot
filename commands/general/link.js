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
    let content = `Click here to link your account: <https://the100.io/linkdiscord/${encodeURIComponent(
      msg.author.id)}>`;
    msg.react("💯");
    return msg.author.send(content);
  }
};
