const { ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const { JOB_MESSAGES } = require("../../assets/job-messages");
const { postRequest, getRequest } = require("../../database/connection");
const { calculateDailyIncome } = require("../../lib/helpers/EconomyHelpers/EconomyHelper");
const { isOlderThan24Hours, timeLeft } = require("../../lib/helpers/TimeDateHelpers/timeHelper");

module.exports.props = {
  commandName: "work",
  description: "Work to earn money!",
  usage: "/work",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: [],
}

module.exports.run = async (client, interaction) => {

  // Fetch career snapshot from the user
  const snapshotResult = await getRequest(`/career/snap/${interaction.guild.id}/${interaction.user.id}`);

  // If no snapshot, or the snapshot is older than 1 day - 24 hours, continue
  if (snapshotResult.status != 200 || isOlderThan24Hours(snapshotResult.createdAt)) {

    // Fetch the user's career (job)
    const userCareerResult = await getRequest(`/career/${interaction.guild.id}/${interaction.user.id}`);

    // If user has a career, return a job-message and update user's balance
    if (userCareerResult.status === 200) {

      // Calculate the income based on the user's career
      const { jobId, level, job } = userCareerResult.data;
      const { wage, raise } = job;

      // Calculate the income based on the user's career
      const income = calculateDailyIncome(wage, raise, level);

      // Get random job message, based on the jobId
      let idx = Math.floor(Math.random() * JOB_MESSAGES[jobId].length);
      const jobMessage = JOB_MESSAGES[jobId][idx].replace('{COIN}', income);

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
        title: `<@${interaction.author.id}>'s work day`,
        description: jobMessage,
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

      // Get 3 random jobs
      const jobsResult = await getRequest(`/career/jobs?limit=3`);
      if (jobsResult.status != 200) {
        return interaction.reply({
          content: `Oops! Something went wrong while fetching available jobs. Please try again later.`,
          ephemeral: true
        })
      }

      // Dynamicly create buttons for the jobs
      const jobButtons = [];
      jobsResult.data.forEach(job => {
        const button = new ButtonBuilder()
          .setCustomId(job.jobId)
          .setLabel(job.name)
          .setStyle('PRIMARY')
          .setDisabled(false);
        jobButtons.push(button);
      });

      // Add the buttons the ActionRow
      const messageComponents = new ActionRowBuilder()
        .addComponents(...jobButtons);

      // Create message fields
      const jobFields = jobsResult.data.map(job => {

        const income = calculateDailyIncome(job.wage, job.raise, userCareerResult.data.level);

        return {
          name: job.name,
          value: `${job.description}
          \nYearly Wage: $${job.wage}
          \nDaily Income (base):${income}%
          \nRaise (per level):${job.raise}%`,
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
        ephemeral: true
      })

      // Collect the button selection
      const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
      const collector = response.createMessageComponentCollector({ options });
      collector.on('collect', async i => {

        const selectedButton = i.customId;

        // Get the selected job
        const selectedJob = jobsResult.data.find(job => job.jobId === selectedButton);
        const income = calculateBaseIncome(selectedJob.wage);

        // Update embed Footer && Fields
        messageEmbed.setDescription(`You have selected a job!`);
        messageEmbed.data.fields = []; // Empty current fields
        messageEmbed.setFields(
          [
            {
              name: selectedJob.name,
              value: `${selectedJob.description}
              \nYearly Wage: $${selectedJob.wage}
              \nDaily Income (base):${income}%
              \nRaise (per level):${selectedJob.raise}%`,
              inline: false
            }
          ]
        );

        // Update the user's career
        const updateUserCareer = await postRequest(`/career/${interaction.guild.id}/${interaction.user.id}`, { jobId: selectedButton, level: 1 });

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
    const timeLeft = timeLeft(snapshotResult.createdAt);

    // return a message that the user has already worked today
    return interaction.reply({
      content: `You have already worked today! Please try again in ${timeLeft}.`,
      ephemeral: true
    })
  }
}