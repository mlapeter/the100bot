const { PermissionsBitField } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();
// This handler is a component (button) interaction, not a slash command --
// its eventual "response" is an edit of the original gaming-session embed,
// not a throwaway placeholder. respondAuxiliary never uses editReply (which
// would clobber that embed with plain error text); it always opens a new
// ephemeral followUp once the interaction has been acknowledged in any way.
// See utils/interactionResponder.js.
const { respondAuxiliary } = require("../utils/interactionResponder");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (!interaction.isButton()) return;

      // BOT-5 (button flavor): api.postReaction below round-trips to the
      // rails API and can exceed Discord's 3s interaction-ack window, same
      // class of bug as the slash commands. For a component interaction
      // whose eventual outcome is editing the original message in place,
      // the correct immediate ack is deferUpdate() (not deferReply()/
      // reply()) -- it acknowledges the click with no visible "thinking"
      // state and no new message, and lets us edit the original message
      // later via editReply() instead of the no-longer-valid
      // interaction.update(). This keeps the end-state UX identical to
      // before: the join/leave/refresh still lands as an in-place edit of
      // the same embed, just acknowledged up front instead of after the
      // API call.
      await interaction.deferUpdate();

      console.log(
        `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction in interactionCreate.js.`
      );

      let action = null;

      // strip out everything except numbers in interaction.customId to get gaming_session_id
      const gaming_session_id = interaction.customId.replace(/[^0-9]/g, "");

      if (interaction.customId.includes("join-")) {
        action = "join_gaming_session";
        console.log("user joining game");
      } else if (interaction.customId.includes("leave-")) {
        action = "leave_gaming_session";
        console.log("user leaving game");
      } else if (interaction.customId.includes("refresh-")) {
        action = "refresh_gaming_session";
        console.log("refreshing game");
      }

      const json = await api.postReaction({
        action: action,
        msg: interaction.message,
        user: interaction.user,
        body: { gaming_session_id: gaming_session_id },
      });

      const { notice, gaming_session } = json;

      // return if no gaming_session
      if (!gaming_session) {
        return;
      }

      const substrings = ["reserve", "waitlist", "You just joined", "Game left"];
      if (gaming_session || (notice && substrings.some((v) => notice.includes(v)))) {
        const receivedEmbed = interaction.message.embeds[0];
        const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
        // Already deferred via deferUpdate() above, so editReply() (not
        // update(), which is no longer valid once acknowledged) edits the
        // original message -- identical end result to the old
        // interaction.update() call.
        await interaction.editReply({ embeds: [exampleEmbed] });
        return;
      } else {
        console.log("interactionCreate.js ERROR:");
        console.log(notice);
        await respondAuxiliary(interaction, notice ? notice : "An error ocurred, please contact us.");
      }
    } catch (error) {
      sendError(error, interaction);
    }
  },
};

const sendError = async (error, interaction) => {
  try {
    console.error(error);
    console.log(interaction);
    const permissions = interaction.channel?.permissionsFor(interaction.client.user);

    // Owner DM report. Best-effort: never let a failure here (e.g. owner
    // has DMs closed) escape and crash the process -- report-only side
    // effect, not user-facing.
    try {
      interaction.client.users.cache
        .get(process.env.OWNER_DISCORD_ID)
        ?.send(
          `Error for command: **${interaction.customId}** with proper permissions: **${permissions?.has(
            PermissionsBitField.Flags.ManageMessages
          )}** in channel ${interaction.channel} in guild ${interaction.guild?.name} - ${interaction.guild} from user ${
            interaction.user
          } - ${interaction.user?.id}`
        );

      interaction.client.users.cache.get(process.env.OWNER_DISCORD_ID)?.send(error.toString());
    } catch (ownerReportError) {
      console.log("sendError OWNER REPORT ERROR: ");
      console.log(ownerReportError);
    }

    // User-facing notice. By the time execute() throws, the interaction has
    // normally already been deferUpdate()'d (BOT-5, see above) -- route
    // through respondAuxiliary so we open a fresh ephemeral followUp
    // instead of a bare interaction.reply() (which would throw: already
    // acknowledged) or an editReply() (which would clobber the original
    // gaming-session embed with plain error text). Fall back to a plain
    // channel message if even that fails (e.g. token fully expired).
    const message =
      "There was an error while executing this command - the developers have been notified and you can also contact us in our support discord: https://discord.gg/EFRQxvUGM6";
    try {
      if (typeof interaction?.reply === "function") {
        await respondAuxiliary(interaction, message);
      } else {
        await interaction.channel?.send(message);
      }
    } catch (replyError) {
      console.log("sendError REPLY ERROR, falling back to channel.send: ");
      console.log(replyError);
      try {
        await interaction.channel?.send(message);
      } catch (channelSendError) {
        console.log("sendError CHANNEL SEND ERROR: ");
        console.log(channelSendError);
      }
    }
  } catch (error) {
    console.error(error);
  }
};
