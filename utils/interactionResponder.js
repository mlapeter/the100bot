// Shared "pick the right discord.js response method" logic (BOT-5) for
// interactions that may already be deferred/replied by the time we need to
// say something -- e.g. after an await on the rails API. Two flavors,
// because deferReply vs deferUpdate mean different things for what
// editReply will touch:
//
//   respondToPrimary  - for interactions whose single deferred response
//     *is* the whole answer (slash commands: deferReply(), then one
//     editReply() with the final text). Reuses/finalizes that placeholder.
//     If the interaction has moved on and already replied once, falls back
//     to a followUp so we don't try to edit a response a second caller
//     already finalized.
//
//   respondAuxiliary - for interactions where editReply would clobber
//     something we don't want to touch (a button's deferUpdate() targets
//     the original embed/card, not a throwaway placeholder). Always sends
//     a *new* ephemeral message via followUp once the interaction has been
//     acknowledged in any way, and only falls back to a bare reply if the
//     interaction is still fully unacknowledged.
//
// Both are best-effort: if discord.js itself throws (token fully expired,
// double-ack race, etc.) the caller gets the rejection and should treat it
// the same as any other failed notification -- log it, don't crash.

const { MessageFlags } = require("discord.js");

async function respondToPrimary(interaction, content) {
  if (interaction.replied) {
    return interaction.followUp({ content, flags: MessageFlags.Ephemeral });
  }
  if (interaction.deferred) {
    return interaction.editReply({ content });
  }
  return interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

async function respondAuxiliary(interaction, content) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp({ content, flags: MessageFlags.Ephemeral });
  }
  return interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

module.exports = { respondToPrimary, respondAuxiliary };
