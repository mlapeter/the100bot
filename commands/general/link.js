const { Command } = require("discord.js-commando");

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
    let content = `Click here to link your account: https://the100.io/linkdiscord/${
      msg.author.username
    }/#${msg.author.discriminator}`;
    console.log(content);
    msg.react("💯");
    return msg.author.send(content);
  }
};
