const { MessageFlags } = require("discord.js");
const { BAN_PREREASONS } = require("../../assets/reason-messages");
const {
  formatExpression,
} = require("../../lib/helpers/StringHelpers/stringHelper");
const {
  deferInteraction,
  replyInteraction,
  followUpInteraction,
} = require("../../utils/InteractionManager");

module.exports.props = {
  commandName: "ban",
  description: "Ban a user from the server",
  usage: "/ban [user] [reason]",
  interaction: {
    type: 1,
    options: [
      {
        name: "user",
        description: "User to ban",
        type: 6,
        required: true,
      },
      {
        name: "reason",
        description: "Reason for the ban",
        type: 3,
        required: true,
        autocomplete: true,
        maxLength: 100,
      },
    ],
  },
  defaultMemberPermissions: ["BanMembers"],
};

module.exports.autocomplete = async (client, interaction) => {
  const focusedReason = interaction.options.getFocused();

  // Get and format the pre-reasons
  const reasons = Object.keys(BAN_PREREASONS).map((reason) => ({
    name: formatExpression(reason),
    value: BAN_PREREASONS[reason],
  }));

  // Get the focussed reason && return the filtered reason
  const filteredReasons = reasons.filter((reason) =>
    reason.name.toLowerCase().includes(focusedReason.toLowerCase())
  );
  interaction.respond(filteredReasons);
};

module.exports.run = async (client, interaction) => {
  await deferInteraction(interaction, true);

  const targetUser = interaction.options.get("user").user;
  const violationReason = interaction.options.get("reason").value || "";

  if (!targetUser) {
    return followUpInteraction(interaction, {
      content: "Oops! Could not find the user",
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    const member = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    if (targetUser.id === interaction.user.id) {
      return followUpInteraction(interaction, {
        content: "Uhm... You cannot ban yourself",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (member && !member.moderatable) {
      return followUpInteraction(interaction, {
        content: `<@${targetUser.id}> is a moderator!`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.guild.bans.create(targetUser.id, {
      reason: `${violationReason} - ${interaction.user.username}`,
    });

    return replyInteraction(interaction, {
      content: `You successfully banned **${targetUser.username}** (${targetUser.id}) for:\n> ${violationReason}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error(`Failed to ban user ${targetUser.id}:`, error);
    return followUpInteraction(interaction, {
      content: `Oops! Something went wrong while trying to ban **${targetUser.username}**`,
      flags: MessageFlags.Ephemeral,
    });
  }
};
