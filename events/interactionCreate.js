const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;
    console.log(
      `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction in interactionCreate.js.`
    );
    console.log(interaction);

    let action = null;

    // strip out everything except numbers in interaction.customId to get gaming_session_id
    const gaming_session_id = interaction.customId.replace(/[^0-9]/g, "");

    if (interaction.customId.includes("join-")) {
      action = "join_gaming_session";
      console.log("user joining game");
    } else if (interaction.customId.includes("leave-")) {
      action = "leave_gaming_session";
      console.log("user leaving game");
    }

    const json = await api.postReaction({
      action: action,
      msg: interaction.message,
      user: interaction.user,
      body: { gaming_session_id: gaming_session_id },
    });
    console.log(json);
    const { notice, gaming_session } = json;

    const substrings = ["reserve", "waitlist", "You just joined", "Game left"];
    if (substrings.some((v) => notice.includes(v))) {
      console.log("CHECKING PERMISSIONS...");
      // check if we have edit message permissions
      if (!interaction.message.channel.permissionsFor(interaction.user).has("MANAGE_MESSAGES")) {
        console.log("NO PERMISSIONS");
        // return interaction.reply("You don't have permissions to edit messages.");
      }

      const receivedEmbed = interaction.message.embeds[0];
      const exampleEmbed = await discordApi.embedGamingSessionDynamic(gaming_session, receivedEmbed);
      await interaction.update({ embeds: [exampleEmbed] });
      // console.log("UPDATED interaction.message: ");
      // console.log(interaction.user);
      return;
    } else {
      // await interaction.deferUpdate();
      console.log("ERROR:");
      console.log(notice);
      // console.log(interaction);
      // await interaction.reply(notice);
      await interaction.reply({ content: notice, ephemeral: true });
    }
  },
};
