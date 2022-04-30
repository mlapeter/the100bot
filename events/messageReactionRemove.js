// const { Permissions } = require("discord.js");
// const { MessageEmbed } = require("discord.js");
// const Api = require("../utils/api");
// const api = new Api();
// const DiscordApi = require("../utils/discordApi");
// const discordApi = new DiscordApi();

// module.exports = (client) => {
//   client.on("messageReactionRemove", async (reaction, user) => {
//     try {
//       if (user.bot) return;

//       if (reaction.partial) {
//         // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
//         try {
//           await reaction.fetch();
//         } catch (error) {
//           console.error("Something went wrong when fetching the message:", error);
//           return;
//         }
//       }

//       console.log(`${reaction.message.author}'s message "${reaction.message.content}" lost a reaction!`);

//       if (reaction.emoji.name === "✅") {
//         console.log("user leaving game");
//         const json = await api.postReaction({
//           action: "leave_gaming_session",
//           msg: reaction.message,
//           user: user,
//           body: {},
//         });
//         console.log(json);
//         const { notice, gaming_session } = json;

//         if (!notice) {
//           console.log("ERROR in messageReactionRemove");
//         }

//         if (!gaming_session) {
//           return;
//         }

//         console.log("GAMING SESSION: ");
//         console.log(gaming_session);

//         const receivedEmbed = reaction.message.embeds[0];

//         const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);

//         // reaction.message.channel.send({ embed: exampleEmbed });
//         reaction.message.edit({ embed: exampleEmbed });
//       }
//     } catch (e) {
//       console.log(e);
//     }
//   });
// };
