// const { Command } = require("discord.js-commando");
// const { RichEmbed } = require("discord.js");
// const Api = require('../../utils/api')
// const api = new Api

// module.exports = class GamesCommand extends Command {
//   constructor(client) {
//     super(client, {
//       name: "feed",
//       group: "group",
//       memberName: "feed",
//       description: "Returns the group feed",
//       throttling: {
//         usages: 2,
//         duration: 60
//       }
//     });
//   }

//   async run(msg) {

//     const example = { "id": 140937, "user_id": null, "group_id": 1578, "game_id": null, "item_type": "new-group-game", "data": { "platform": "battle-net", "game_name": "Destiny 2", "gaming_session_id": "1283625", "gaming_session_category": "Raid - Last Wish", "gaming_session_start_time": "2020-02-11T15:16:00.000-08:00" }, "related_users": { "avatar_urls": ["https://pwntastic-avatar-dev.s3.amazonaws.com/uploads/user/avatar/5/main_mike-hand.png"] }, "title": "New Group Game", "body": "@[muhuhuhaha] created: Destiny 2 - Raid - Last Wish in The100 Lounge. \n \n public.", "target_url": "/gaming_sessions/1283625", "target_url_app": "'GamingSession', {gamingSessionId: 1283625}", "author_user_id": 5, "author_avatar_url": "https://pwntastic-avatar-dev.s3.amazonaws.com/uploads/user/avatar/5/main_mike-hand.png", "author_gamertag": "muhuhuhaha", "action_completed": null, "display_after": "2020-02-11T10:16:53.000-08:00", "created_at": "2020-02-11T10:16:53.484-08:00", "updated_at": "2020-02-11T10:16:53.484-08:00", "embed_url": null, "embed_type": null, "image_url": "https://pwntastic-avatar-dev.s3.amazonaws.com/uploads/game_activity/main_image/271/feed_Destiny2_Raid_LastWish_.png", "display_after_days": null, "gaming_session_id": null, "repeat_weekly": null, "repeat_monthly": null }

//     const json = await api.postAction({ action: 'list_group_feed', msg: msg, body: {} })

//     msg.say(json.text);
//     if (!json.attachments || !json.attachments.length) {
//       // No upcoming games
//     } else {
//       json.attachments.forEach(function (attachment) {
//         console.log(attachment);
//         const embed = new RichEmbed()
//           .setTitle(attachment.title)
//           .setURL(attachment.title_link)
//           .setDescription(attachment.text)
//           .setColor(attachment.color);
//         msg.embed(embed);
//       });
//     }

//   }
// };
