const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();
const chrono = require("chrono-node");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("c")
    .setDescription("Quickly create a simple event")
    .addStringOption((option) => option.setName("input").setDescription("The input to echo back")),
  async execute(interaction) {
    const value = interaction.options.getString("input");
    // if (!value) {
    //   return interaction.reply("Type the event name and time, like 'apex legends in 2 hours'");
    // }

    if (!value || value == "none") {
      await interaction.reply("Help:");
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");
      return await interaction.channel.send({ embeds: [helpEmbed] });
    }

    // try {
    // return if user is in a DM channel
    if (interaction.channel.type === "dm") {
      return interaction.author.send(
        "Gaming sessions can only be created in public channels, but if you want to create a totally private gaming session you can use our website: <https://www.the100.io/gaming_sessions/new>."
      );
    }

    console.log("VALUE:");
    console.log(value);
    const results = chrono.parse(value);
    if (!results) {
      await interaction.reply("Help:");
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");
      return interaction.embed(helpEmbed);
    }

    console.log("CHRONO PARSED RESULTS:");
    console.log(results);
    const time_text = results[0].text;
    console.log(time_text);
    const remainder = value.replace(time_text, "");
    console.log("PARSED REMAINDER:");
    console.log(remainder);

    const json = await api.postAction({
      action: "create_gaming_session_simple",
      interaction: interaction,
      body: { message: remainder ? remainder : value, time: time_text },
    });

    // EMBED RETURNED GAMING SESSION //
    const { notice, gaming_session } = json;
    if (notice.includes("Gaming Session Created!")) {
      interaction.reply("Gaming session created!");
      discordApi.embedGamingSession(interaction, gaming_session);
    } else {
      setTimeout(() => {
        interaction.reply.delete();
      }, 5000);
      await interaction.reply(notice);
    }
    // } catch (e) {
    //   console.log(e);
    //   msg.react("💩");
    //   return msg.author.send(
    //     "Type !link to link your The100.io account first, or contact us at <https://discord.gg/EFRQxvUGM6>"
    //   );
    // }
    // }
  },
};
