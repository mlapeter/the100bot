const { CommandoClient } = require("discord.js-commando");
const SequelizeProvider = require("./utils/sequelize");
const Sequelize = require("sequelize");
const path = require("path");
require("dotenv").config();

const Api = require("./utils/api");
const api = new Api();
const DiscordApi = require("./utils/discordApi");
const discordApi = new DiscordApi();
const { MessageEmbed } = require("discord.js");
const { Permissions } = require("discord.js");

const client = new CommandoClient({
  commandPrefix: "!",
  owner: process.env.OWNER_DISCORD_ID,
  invite: "https://discord.gg/dBZRVB9",
  disableEveryone: true,
  unknownCommandResponse: false,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.on("messageReactionAdd", async (reaction, user) => {
  // return if the user is the bot
  if (user.bot) return;

  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  // Now the message has been cached and is fully available
  console.log(
    `${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`
  );
  // The reaction is now also fully available and the properties will be reflected accurately:
  console.log(reaction.emoji.name);
  console.log(reaction.message.id);
  console.log(user.username);
  console.log(user.id);

  if (reaction.emoji.name === "✅") {
    console.log("user joining game");
    const json = await api.postReaction({
      action: "join_gaming_session",
      msg: reaction.message,
      user: user,
      body: {},
    });
    const { notice, gaming_session } = json;
    const receivedEmbed = reaction.message.embeds[0];
    const exampleEmbed = await discordApi.embedGamingSessionDynamic(
      user,
      gaming_session,
      receivedEmbed
    );
    reaction.message.edit({ embed: exampleEmbed });
  }
  // need to handle errors by displaying notice to user

  if (reaction.emoji.name === "📝") {
    console.log("user editing game");

    let content =
      "Must be the event creator or have Manager Server permission to edit.";
    console.log("message.author.id");
    console.log(reaction.message.author.id);
    console.log(reaction.message.author.username);
    console.log("user.id");
    console.log(user.id);
    console.log(user.username);

    // check if user has MANAGE_SERVER permission

    // if (
    //   reaction.message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)
    // ) {
    //   console.log("This member can kick");
    // } else {
    //   console.log("This member CANNOT kick");
    // }

    // get the permissions of the user who reacted to the message
    const member = reaction.message.guild.members.cache.get(user.id);

    console.log("PERMISSIONS:");
    console.log(member.permissions);
    console.log(member.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
    console.log(Permissions.FLAGS);

    if (
      reaction.message.author.id === user.id ||
      // user.permissions.has("MANAGE_SERVER"
      member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    ) {
      content = `Click here to edit your gaming session: <http://localhost:3000/gaming_sessions/${reaction.message.id}/edit>`;
    }

    return user.send(content);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }

  if (reaction.emoji.name === "✅") {
    console.log("user leaving game");
    const json = await api.postReaction({
      action: "leave_gaming_session",
      msg: reaction.message,
      user: user,
      body: {},
    });
    console.log(json);
    const { notice, gaming_session } = json;
    console.log("GAMING SESSION: ");
    console.log(gaming_session);

    const receivedEmbed = reaction.message.embeds[0];

    const exampleEmbed = await discordApi.embedGamingSessionDynamic(
      user,
      gaming_session,
      receivedEmbed
    );

    // reaction.message.channel.send({ embed: exampleEmbed });
    reaction.message.edit({ embed: exampleEmbed });
  }
});

if (process.env.THE100_API_BASE_URL != "http://localhost:3000/api/v2/") {
  console.log("Connecting to database...");
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  sequelize
    .authenticate()
    .then((response) => {
      console.log("Database connected.");
    })
    .catch((e) => {
      console.error("Unable to connect to the database:", e);
    });

  client.setProvider(new SequelizeProvider(sequelize));
}

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["general", "General Commands"],
    ["group", "Group Commands"],
    ["gamingsession", "Gaming Session Commands"],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("with The100.io");
});
client.on("error", (error) => {
  console.log("Client Error");
  console.error("The WebSocket encountered an error:", error);
});

client
  .login(process.env.DISCORD_BOT_TOKEN)
  .then()
  .catch((error) => {
    console.log("Login failed! ");
    console.log(error);
  }); //login in discord
