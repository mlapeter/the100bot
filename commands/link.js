const crypto = require("node:crypto");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");

// Signed link to the100.io's /linkdiscord page. The site only links a Discord
// account when the URL carries a valid signature from us, so nobody can craft
// a link that ties someone else's Discord id to their the100 account.
//
// WIRE FORMAT — must stay byte-identical with pwntastic's
// app/models/discord_link_token.rb:
//
//   payload = `${discordId}.${guildId}.${ts}.${nonce}`
//   sig     = HMAC-SHA256(DISCORD_LINK_SECRET, payload), lowercase hex
//
//   guildId  the server the command ran in, or "" from a DM (signed because
//            linking auto-joins the user to that server's the100 group)
//   ts       integer Unix seconds; the site rejects links older than 15 minutes
//   nonce    random hex
//
// DISCORD_LINK_SECRET must be set to the same value on the100bot and pwntastic.
const buildSignedLinkUrl = ({ baseUrl, secret, discordId, guildId, username, now = Date.now() }) => {
  const ts = Math.floor(now / 1000);
  const nonce = crypto.randomBytes(8).toString("hex");
  const payload = `${discordId}.${guildId}.${ts}.${nonce}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const query = new URLSearchParams({
    u: username || "",
    guild_id: guildId,
    ts: String(ts),
    nonce,
    sig,
    created_from: "discord-bot",
  });
  return `${baseUrl}linkdiscord/${encodeURIComponent(discordId)}?${query.toString()}`;
};

module.exports = {
  data: new SlashCommandBuilder().setName("link").setDescription("Link your the100.io account to Discord."),
  buildSignedLinkUrl,
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const secret = process.env.DISCORD_LINK_SECRET;
    if (!secret) {
      // Never fall back to an unsigned link: the site refuses those now.
      console.error("/link: DISCORD_LINK_SECRET is not set");
      await interaction.editReply(
        "Account linking is temporarily unavailable — sorry! Please try again later, or reach us at https://discord.gg/PSeRUMz."
      );
      return;
    }

    const linkUrl = buildSignedLinkUrl({
      baseUrl: process.env.THE100_BASE_URL || "https://www.the100.io/",
      secret,
      discordId: interaction.user.id,
      guildId: interaction.guild ? interaction.guild.id : "",
      username: interaction.user.username,
    });

    // Try to DM the link (keeps it private). If the user has DMs closed, fall
    // back to showing it in the ephemeral reply so they're never stuck.
    try {
      await interaction.user.send(
        `Here's your link to connect your the100.io account — it only takes a few seconds:\n${linkUrl}\n\n` +
          "It works for the next 15 minutes. Once you're linked, come back and create or join sessions right here in Discord."
      );
      await interaction.editReply("Check your DMs — I just sent you a link to connect your the100.io account. ✅");
    } catch (e) {
      console.log(`Could not DM /link to ${interaction.user.id}, replying inline`);
      await interaction.editReply(
        `Here's your link to connect your the100.io account (only takes a few seconds, works for 15 minutes):\n${linkUrl}`
      );
    }
  },
};
