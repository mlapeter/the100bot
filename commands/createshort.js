const { SlashCommandBuilder } = require("@discordjs/builders");
const Api = require("../utils/api");
const api = new Api();
const DiscordApi = require("../utils/discordApi");
const discordApi = new DiscordApi();
const chrono = require("chrono-node");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("c")
    .setDescription("Quickly create a simple event!")
    .addStringOption((option) => option.setName("input").setDescription("event name and when it starts.")),
  async execute(interaction) {
    const value = interaction.options.getString("input");

    if (!value || value == "none") {
      await interaction.reply("Help:");
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");
      return await interaction.channel.send({ embeds: [helpEmbed] });
    }

    // return if user is in a DM channel
    if (interaction.channel.type === "dm") {
      return interaction.author.send(
        "Gaming sessions can only be created in public channels, but if you want to create a totally private gaming session you can use our website: <https://www.the100.io/gaming_sessions/new>."
      );
    }

    const results = chrono.parse(value);
    // return if results is an empty array or null
    if (!results || results.length == 0) {
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");

      return await interaction.reply({
        content: "I couldn't understand your input. Try writing it like 'apex legends tomorrow at 3pm'",
        embeds: [helpEmbed],
      });
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
      discordApi.embedGamingSessionWithReactions(interaction, gaming_session);
      interaction.reply("Gaming session created!");
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
  },
};
