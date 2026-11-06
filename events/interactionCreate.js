const { PermissionsBitField, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

const SUPPORT_INVITE = "https://discord.gg/PSeRUMz";

// A message only the person who clicked can see. Works whether or not the
// interaction has been acknowledged yet.
const replyPrivately = async (interaction, content) => {
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
  } catch (e) {
    console.error("replyPrivately failed:", e);
  }
};

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    try {
      // Acknowledge inside Discord's 3-second window BEFORE calling the100.io.
      // A join runs synchronous feed/webhook work in Rails and has taken 12s;
      // without this Discord showed "This interaction failed" even though the
      // join went through. After deferUpdate, editReply edits the session
      // embed this button belongs to.
      await interaction.deferUpdate();

      console.log(`${interaction.user.tag} clicked ${interaction.customId} in #${interaction.channel?.name}`);

      let action = null;

      // strip out everything except numbers in interaction.customId to get gaming_session_id
      const gaming_session_id = interaction.customId.replace(/[^0-9]/g, "");

      if (interaction.customId.includes("join-")) {
        action = "join_gaming_session";
      } else if (interaction.customId.includes("leave-")) {
        action = "leave_gaming_session";
      } else if (interaction.customId.includes("refresh-")) {
        action = "refresh_gaming_session";
      }

      const json = await api.postReaction({
        action: action,
        msg: interaction.message,
        user: interaction.user,
        body: { gaming_session_id: gaming_session_id },
        notify: (content) => replyPrivately(interaction, content),
      });

      // postReaction already told the clicker (privately) on an API error.
      if (!json) return;

      const { notice, gaming_session } = json;

      // No updated session came back. This is the common "you're not linked yet"
      // case (the API returns a signed link prompt as the notice) — surface it to
      // just this user rather than silently doing nothing.
      if (!gaming_session) {
        if (notice) await replyPrivately(interaction, notice);
        return;
      }

      const receivedEmbed = interaction.message.embeds[0];
      const updatedEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
      await interaction.editReply({ embeds: [updatedEmbed] });
    } catch (error) {
      sendError(error, interaction);
    }
  },
};

const sendError = async (error, interaction) => {
  try {
    console.error(error);
    const permissions = interaction.channel?.permissionsFor(interaction.client.user);
    if (process.env.OWNER_DISCORD_ID) {
      // fetch, not cache.get: the owner is rarely in the user cache, so the old
      // cache lookup meant these DMs almost never arrived.
      const owner = await interaction.client.users.fetch(process.env.OWNER_DISCORD_ID).catch(() => null);
      await owner
        ?.send(
          `Error for button: **${interaction.customId}** with proper permissions: **${permissions?.has(
            PermissionsBitField.Flags.ManageMessages
          )}** in channel ${interaction.channel} in guild ${interaction.guild?.name} - ${interaction.guild} from user ${
            interaction.user
          } - ${interaction.user?.id}\n${error}`
        )
        .catch(() => null);
    }

    await replyPrivately(
      interaction,
      `Sorry, something went wrong handling that. We've been notified — you can also reach us at ${SUPPORT_INVITE}.`
    );
  } catch (e) {
    console.error(e);
  }
};
