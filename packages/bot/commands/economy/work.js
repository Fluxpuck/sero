const { ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { JOB_MESSAGES } = require("../../assets/job-messages");
const { postRequest, getRequest } = require("../../database/connection");
const { calculateDailyIncome, calculateBaseIncome } = require("../../lib/helpers/EconomyHelpers/EconomyHelper");
const { isFromYesterdayOrOlder, getTimeUntilTomorrow, isTimestampFromToday } = require("../../lib/helpers/TimeDateHelpers/timeHelper");

module.exports.props = {
  commandName: "work",
  description: "Work to earn money!",
  usage: "/work",
  interaction: {},
  defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {

  // Fetch career snapshot from the user
  const snapshotResult = await getRequest(`/career/snap/${interaction.guild.id}/${interaction.user.id}`);

  // If no snapshot, or the snapshot is older than 1 day - 24 hours, continue
  if (snapshotResult.status != 200 || isTimestampFromToday(snapshotResult.createdAt) == false) {

    // Fetch the user's career (job)
    const userCareerResult = await getRequest(`/career/${interaction.guild.id}/${interaction.user.id}`);

    // If user has a career, return a job-message and update user's balance
    if (userCareerResult.status === 200) {

      // Calculate the income based on the user's career
      const { jobId, level, job } = userCareerResult.data;
      const { emoji, name, wage, raise } = job;

      // Calculate the income based on the user's career
      const income = calculateDailyIncome(wage, raise, level);

      // Get random job message, based on the jobId
      let idx = Math.floor(Math.random() * JOB_MESSAGES[jobId].length);
      const jobMessage = JOB_MESSAGES[jobId][idx].replace('{COIN}', `**${income}**`);

      // Update the user's balance
      const updateUserBalance = await postRequest(`/balance/${interaction.guild.id}/${interaction.user.id}`, { amount: income });
      if (updateUserBalance.status != 200) {
        return interaction.reply({
          content: `Oops! Something went wrong while updating your balance. Please try again later.`,
          ephemeral: true
        })
      }

      // Create message embed
      const embed = createCustomEmbed({
        title: `${interaction.user.username}'s work day`,
        description: `${jobMessage}`,
        footer: { text: `${emoji} ${name}` }
      })

      // Add the work to the work snapshot
      const snapshotDetails = { jobId: jobId, income: income };
      const addWorkSnapshot = await postRequest(`/career/snap/${interaction.guild.id}/${interaction.user.id}`, snapshotDetails);

      // If the work snapshot was not added successfully, return an error message
      if (addWorkSnapshot.status != 200) {
        return interaction.reply({
          content: `Oops! Something went wrong while working. Please try again later.`,
          ephemeral: true
        })
      }

      // If the work snapshot was added successfully, return a message
      if (addWorkSnapshot.status === 200) {
        return interaction.reply({
          embeds: [embed],
          ephemeral: false
        })
      }
    }

    // If no career, start the process of getting a job
    if (userCareerResult.status != 200) {

      // Predefine the job data
      let randomJobData = [];

      // Check if the user already has job-options
      const userJobOptions = interaction.user?.jobOptions

      if (userJobOptions) {

        randomJobData = userJobOptions

      } else {

        // Get 3 random jobs
        const jobsResult = await getRequest(`/career/jobs?limit=3`);
        if (jobsResult.status != 200) {
          return interaction.reply({
            content: `Oops! Something went wrong while fetching available jobs. Please try again later.`,
            ephemeral: true
          })
        }

        randomJobData = jobsResult.data;
      }

      // Set default career level
      const DEFAULT_CAREER_LEVEL = 1;

      // Add job options to the user
      interaction.user.jobOptions = randomJobData;

      // Dynamicly create buttons for the jobs
      const jobButtons = [];
      randomJobData.forEach(job => {
        const button = new ButtonBuilder()
          .setCustomId(`${job.jobId}`)
          .setLabel(`${job.name}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(false);
        jobButtons.push(button);
      });

      // Add the buttons the ActionRow
      const messageComponents = new ActionRowBuilder()
        .addComponents(...jobButtons);

      // Create message fields
      const jobFields = randomJobData.map(job => {

        // Calculate the income based on the user's career
        const income = calculateDailyIncome(job.wage, job.raise, DEFAULT_CAREER_LEVEL);

        return {
          name: `${job.emoji} - ${job.name}`,
          value: `*${job.description}*\nSalary: \`$${job.wage}\`\nDaily Income (base): \`$${income}\`\nRaise (per level): \`${job.raise}%\``,
          inline: false
        }
      })

      // Create message embed
      const messageEmbed = createCustomEmbed({
        title: "Available jobs offers",
        description: "Please select a job to start working!",
        fields: [...jobFields],
      })

      // Send the message
      const response = await interaction.reply({
        embeds: [messageEmbed],
        components: [messageComponents],
        ephemeral: false
      })

      // Collect the button selection
      const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
      const collector = response.createMessageComponentCollector({ options });
      collector.on('collect', async i => {

        // Block input from other users
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: `Oops! You can't select a job for someone else.`,
            ephemeral: true
          })
        }

        const selectedButton = i.customId;

        // Get the selected job
        const selectedJob = randomJobData.find(job => job.jobId == selectedButton);
        const income = calculateBaseIncome(selectedJob.wage);

        // Update embed Footer && Fields
        messageEmbed.setTitle(`You have selected a job!`);
        messageEmbed.setDescription(`You will be able to execute \`/work\` on a daily basis to earn money.`);
        messageEmbed.data.fields = []; // Empty current fields
        messageEmbed.setFields(
          [
            {
              name: `${selectedJob.emoji} - ${selectedJob.name}`,
              value: `*${selectedJob.description}*\nSalary: \`$${selectedJob.wage}\`\nDaily Income (base): \`$${income}\`\nRaise (per level): \`${selectedJob.raise}%\``,
              inline: false
            }
          ]
        );

        // Update the user's career
        const updateUserCareer = await postRequest(`/career/${interaction.guild.id}/${interaction.user.id}`, { jobId: selectedJob.jobId, level: 1 });

        // If the user's career was updated successfully, return a message
        if (updateUserCareer.status === 200) {
          // Update the interaction, disabling the buttons
          return i.update({
            embeds: [messageEmbed],
            components: [],
          })
        }

        // If the user's career was not updated successfully, return an error message
        return i.update({
          content: `Oops! Something went wrong while updating your career. Please try again later.`,
          ephemeral: true
        })

      });
    }

  } else {

    // Calculate the time left until the user can work again
    const remainingTime = getTimeUntilTomorrow(snapshotResult.data.createdAt);

    // return a message that the user has already worked today
    return interaction.reply({
      content: `You have already worked today! Please try again in ${remainingTime}.`,
      ephemeral: true
    })

  }
}