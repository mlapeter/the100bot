const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

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

      const { notice, gaming_session } = json;

      // return if no gaming_session
      if (!gaming_session) {
        return;
      }

      const substrings = ["reserve", "waitlist", "You just joined", "Game left"];
      if (gaming_session || (notice && substrings.some((v) => notice.includes(v)))) {
        const receivedEmbed = interaction.message.embeds[0];
        const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
        await interaction.update({ embeds: [exampleEmbed] });
        return;
      } else {
        console.log("ERROR:");
        console.log(notice);
        await interaction.reply({ content: notice ? notice : "An error ocurred, please contact us.", ephemeral: true });
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
    interaction.client.users.cache
      .get(process.env.OWNER_DISCORD_ID)
      .send(
        `Error for command: **${interaction.customId}** with proper permissions: **${permissions?.has(
          "MANAGE_MESSAGES"
        )}** in channel ${interaction.channel} in guild ${interaction.guild?.name} - ${interaction.guild} from user ${
          interaction.user
        } - ${interaction.user?.id}`
      );

    interaction.client.users.cache.get(process.env.OWNER_DISCORD_ID).send(error);

    await interaction.channel.send(
      "There was an error while executing this command - the developers have been notified and you can also contact us in our support discord: https://discord.gg/EFRQxvUGM6"
    );
  } catch (error) {
    console.error(error);
  }
};
