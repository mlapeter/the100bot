const { PermissionsBitField, MessageFlags } = require("discord.js");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

const SUPPORT_INVITE = "https://discord.gg/PSeRUMz";

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (!interaction.isButton()) return;
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

      // postReaction already messaged the channel on an API error.
      if (!json) return;

      const { notice, gaming_session } = json;

      // No updated session came back. This is the common "you're not linked yet"
      // case (the API returns a link prompt as the notice) — surface it to just
      // this user rather than silently doing nothing.
      if (!gaming_session) {
        if (notice) {
          await interaction.reply({ content: notice, flags: MessageFlags.Ephemeral });
        }
        return;
      }

      const receivedEmbed = interaction.message.embeds[0];
      const updatedEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
      await interaction.update({ embeds: [updatedEmbed] });
    } catch (error) {
      sendError(error, interaction);
    }
  },
};

const sendError = async (error, interaction) => {
  try {
    console.error(error);
    const permissions = interaction.channel?.permissionsFor(interaction.client.user);
    interaction.client.users.cache
      .get(process.env.OWNER_DISCORD_ID)
      ?.send(
        `Error for button: **${interaction.customId}** with proper permissions: **${permissions?.has(
          PermissionsBitField.Flags.ManageMessages
        )}** in channel ${interaction.channel} in guild ${interaction.guild?.name} - ${interaction.guild} from user ${
          interaction.user
        } - ${interaction.user?.id}`
      );

    interaction.client.users.cache.get(process.env.OWNER_DISCORD_ID)?.send(error.toString());

    await interaction.channel?.send(
      `Sorry, something went wrong handling that. We've been notified — you can also reach us at ${SUPPORT_INVITE}.`
    );
  } catch (error) {
    console.error(error);
  }
};
