// Uses the global fetch built into Node 18+ (no node-fetch dependency needed).

const SUPPORT_INVITE = "https://discord.gg/EFRQxvUGM6";

// Reply to an interaction whether or not it has already been deferred/replied.
// Slow commands call deferReply() first (so the token doesn't expire and show a
// false "interaction failed" banner); once deferred we must use editReply()
// rather than reply(). This helper picks the right one so error paths never
// crash a deferred command. When passed a plain Message (button/webhook flows)
// it falls back to replying in-channel.
const replyOrEdit = async (target, content) => {
  try {
    if (!target) return;
    if (typeof target.editReply === "function" && (target.deferred || target.replied)) {
      return await target.editReply(content);
    }
    if (typeof target.reply === "function") {
      return await target.reply(content);
    }
    if (target.channel && typeof target.channel.send === "function") {
      return await target.channel.send(content);
    }
  } catch (e) {
    console.log("replyOrEdit error:");
    console.log(e);
  }
};

const NOT_LINKED_MESSAGE =
  "I couldn't find a the100.io group connected to this channel yet. A server admin can add it in about two minutes: open your group's **Edit** page on the100.io and click **Add the100.io Discord Bot**. That link also recreates the channel webhook, so use it rather than an old invite link. Need a hand? " +
  SUPPORT_INVITE;

const GENERIC_ERROR_MESSAGE =
  "Something went wrong on our end — sorry about that. Please try again in a moment. If it keeps happening, let us know at " +
  SUPPORT_INVITE +
  " and we'll get it sorted.";

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
    console.log("RESPONSE:");
    console.log(res.status);

    if (res.status == 404 || res.status == 401) {
      await replyOrEdit(interaction, NOT_LINKED_MESSAGE);
      return null;
    } else if (res.status !== 201) {
      await replyOrEdit(interaction, GENERIC_ERROR_MESSAGE);
      return null;
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
    if (res.status == 404 || res.status == 401) {
      await msg.channel.send(NOT_LINKED_MESSAGE);
      return null;
    } else if (res.status !== 201) {
      await msg.channel.send(GENERIC_ERROR_MESSAGE);
      return null;
    }
    return await res.json();
  }
};
