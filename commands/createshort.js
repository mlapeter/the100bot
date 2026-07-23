const { SlashCommandBuilder, ChannelType, MessageFlags } = require("discord.js");
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
    // BOT-5: this command's happy path round-trips to the rails API
    // (create_gaming_session_simple), which can exceed Discord's 3-second
    // interaction-ack window -- the exact failure reproduced live on /c.
    // Defer immediately, before any branching, so every path below has the
    // ~15 minute editReply/followUp window instead of the 3s reply window.
    // Deferred ephemeral: the actual session card is posted publicly via
    // discordApi.embedGamingSessionWithReactions -> channel.send, which is
    // NOT the interaction reply, so it's unaffected by this; only the small
    // interaction-tied confirmation/help/error texts are ephemeral, which
    // preserves (and makes consistent) the ephemeral error case from the
    // original code.
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const value = interaction.options.getString("input");

    if (!value || value == "none") {
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");
      return await interaction.editReply({ content: "Help:", embeds: [helpEmbed] });
    }

    // return if user is in a DM channel
    if (interaction.channel?.type === ChannelType.DM) {
      // (was `interaction.author.send(...)` -- interaction has no `.author`,
      // only `.user`; that would have thrown on this exact path.)
      return interaction.editReply(
        "Gaming sessions can only be created in public channels, but if you want to create a totally private gaming session you can use our website: <https://www.the100.io/gaming_sessions/new>."
      );
    }

    const results = chrono.parse(value);
    // return if results is an empty array or null
    if (!results || results.length == 0) {
      const helpEmbed = await discordApi.helpEmbed(interaction, "", "");

      return await interaction.editReply({
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
      await interaction.editReply("Gaming session created!");
    } else {
      await interaction.editReply({ content: notice });
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
