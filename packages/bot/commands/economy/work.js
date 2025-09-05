const {
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { JOB_MESSAGES } = require("../../assets/job-messages");
const { postRequest, getRequest } = require("../../database/connection");
const {
  calculateDailyIncome,
  calculateBaseIncome,
} = require("../../lib/helpers/EconomyHelpers/economyHelper");
const {
  getTimeUntil,
} = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const {
  getUserCareerJobOptions,
} = require("../../lib/resolvers/userJobResolver");
const {
  deferInteraction,
  replyInteraction,
  updateInteraction,
  followUpInteraction,
} = require("../../utils/InteractionManager");

const BASE_WORK_EXPERIENCE = 250;

module.exports.props = {
  commandName: "work",
  description: "Work to earn money!",
  usage: "/work",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: ["SendMessages"],
  cooldown: 2 * 60, // 2 minute cooldown
};

module.exports.run = async (client, interaction) => {
  await deferInteraction(interaction, false);

  // Fetch the user's career (job)
  // Missing Route: API route for fetching user career needs to be implemented
  const userCareerResult = await getRequest(
    `/guild/${interaction.guild.id}/economy/career/${interaction.user.id}`
  );
  if (userCareerResult.status === 404) {
    // Fetch the user's job options
    const jobOptions = await getUserCareerJobOptions(
      interaction.guild.id,
      interaction.user.id
    );
    if (!jobOptions) {
      await interaction.deleteReply();
      return interaction.followUp({
        content:
          "Oops! Something went wrong while fetching your job options. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Set default career level
    const DEFAULT_CAREER_LEVEL = 1;

    // Dynamicly create buttons for the jobs
    const jobButtons = [];
    jobOptions.forEach((job) => {
      const button = new ButtonBuilder()
        .setCustomId(`${job.jobId}`)
        .setLabel(`${job.name}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      jobButtons.push(button);
    });

    // Add the buttons the ActionRow
    const messageComponents = new ActionRowBuilder().addComponents(
      ...jobButtons
    );

    // Create message fields
    const jobFields = jobOptions.map((job) => {
      // Calculate the income based on the user's career
      const income = calculateDailyIncome(
        job.salary,
        job.payRaise,
        DEFAULT_CAREER_LEVEL
      );
      const salary = job.salary.toLocaleString();

      return {
        name: `${job.emoji} - ${job.name}`,
        value: `*${job.description}*\nSalary: \`$${salary}\`\nDaily Income (base): \`$${income}\`\nRaise (per level): \`${job.payRaise}%\``,
        inline: false,
      };
    });

    // Create message embed
    const messageEmbed = createCustomEmbed({
      title: "Available jobs offers",
      description: "Please select a job to start working!",
      fields: [...jobFields],
    });

    // Send the message
    const response = await replyInteraction(interaction, {
      embeds: [messageEmbed],
      components: [messageComponents],
    });

    // Collect the button selection
    const options = {
      componentType: ComponentType.Button,
      idle: 300_000,
      time: 3_600_000,
    };
    const collector = response.createMessageComponentCollector({ options });
    collector.on("collect", async (i) => {
      // Block input from other users
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: `Oops! You can't select a job for someone else.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const selectedButton = i.customId;

      // Get the selected job
      const selectedJob = jobOptions.find((job) => job.jobId == selectedButton);
      const income = calculateBaseIncome(selectedJob.salary);
      const salary = selectedJob.salary.toLocaleString();

      // Update embed Footer && Fields
      messageEmbed.setTitle(`You have selected a job!`);
      messageEmbed.setDescription(
        `You will be able to execute \`/work\` on a daily basis to earn money.`
      );
      messageEmbed.data.fields = []; // Empty current fields
      messageEmbed.setFields([
        {
          name: `${selectedJob.emoji} - ${selectedJob.name}`,
          value: `*${selectedJob.description}*\nSalary: \`$${salary}\`\nDaily Income (base): \`$${income}\`\nRaise (per level): \`${selectedJob.payRaise}%\``,
          inline: false,
        },
      ]);

      // Update the user's career
      // Missing Route: API route for updating user career needs to be implemented
      const updateUserCareer = await postRequest(
        `/guild/${interaction.guild.id}/economy/career`,
        { userId: interaction.user.id, jobId: selectedJob.jobId, level: 1 }
      );

      // If the user's career was updated successfully, return a message
      if (updateUserCareer.status === 200) {
        // Update the interaction, disabling the buttons
        return updateInteraction(i, {
          embeds: [messageEmbed],
          components: [],
        });
      }

      // If the user's career was not updated successfully, return an error message
      return updateInteraction(i, {
        content: `Oops! Something went wrong while updating your career. Please try again later.`,
        flags: MessageFlags.Ephemeral,
      });
    });
  } else if (userCareerResult.status === 200) {
    // Check if the user has already worked today
    // Missing Route: API route for checking daily work activity needs to be implemented
    const dailyWorkResult = await getRequest(
      `/guild/${interaction.guildId}/activities/user/${interaction.user.id}/daily-work?today=true`
    );
    if (dailyWorkResult.status === 200) {
      // Get the daily-work activitie(s) of today
      const activities = dailyWorkResult.data;
      if (activities.length > 0) {
        // return a message that the user has already worked today
        await interaction.deleteReply();
        return interaction.followUp({
          content: `You have already worked today! Please try again in ${getTimeUntil(
            "tomorrow"
          )}.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    try {
      const { job, level } = userCareerResult.data;
      const { jobId, emoji, name, salary, payRaise } = job;

      // Calculate the income based on the user's career
      const income = calculateDailyIncome(salary, payRaise, level);

      // Get random job message, based on the jobId
      let idx = Math.floor(Math.random() * JOB_MESSAGES[jobId].length);
      const jobMessage = JOB_MESSAGES[jobId][idx].replace(
        "{COIN}",
        `**${income}**`
      );

      // Create message embed
      const embed = createCustomEmbed({
        description: `${jobMessage}`,
        footer: { text: `${emoji} ${name} - ${interaction.user.username}` },
      });

      // Store the transfer activity in the database
      // Missing Route: API route for storing activities needs to be implemented
      postRequest(`/guild/${interaction.guild.id}/activities`, {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        type: "daily-work",
        additional: {
          income: income,
        },
      });

      // Add experience points to the user's career
      // Missing Route: API route for gaining experience points needs to be implemented
      postRequest(
        `/guild/${interaction.guild.id}/economy/exp/gain/${interaction.user.id}`,
        { amount: BASE_WORK_EXPERIENCE }
      );

      // Deposit the income in the user's bank account
      // Missing Route: API route for bank deposit needs to be implemented
      const bankDeposit = await postRequest(
        `/guild/${interaction.guild.id}/economy/balance/${interaction.user.id}`,
        { amount: income, type: 'bank' }
      );
      if (bankDeposit?.status !== 200) {
        await followUpInteraction(interaction, {
          content: `Uh oh! Something went wrong while transfering your hard earned money.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        // reply with the embed
        return replyInteraction(interaction, {
          embeds: [embed],
        });
      }
    } catch (error) {
      await followUpInteraction(interaction, {
        content: `Oops! Something went wrong while working. Please try again later.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  } else {
    await followUpInteraction(interaction, {
      content: `Oops! Something went wrong while fetching your career. Please try again later.`,
      flags: MessageFlags.Ephemeral,
    });
  }
};
