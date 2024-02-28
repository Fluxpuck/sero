const { postRequest, getRequest } = require("../../database/connection");
const {generateWorkResponse, getJobDetails, getRandomJob} = require("../../../bot/lib/helpers/EconomyHelpers/EconomyHelper")
const { createCustomEmbed } = require('../../assets/embed');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports.props = {
    commandName: "work",
    description: "Work for your job.",
    usage: "/work",
    interaction: {
        type: 1,
        options: [],
    },
    defaultMemberPermissions: ['KickMembers'],
}

module.exports.run = async (client, interaction) => {


  // 24hr cooldown key
  const cooldownKey = interaction.user.id + interaction.id;

  if(client.cooldowns.has(cooldownKey) === false) {

  // Get the user's job using endpoint && return the jobId from the result.
  const result = await getRequest(`/career/${interaction.guild.id}/${interaction.user.id}`);
  const { jobId } = result.data;

    // If user does not exist (Based off status 404) return and create that user's career profile.
  if(result.status === 404) {
    const job_1 = await getRandomJob();
    const job_2 = await getRandomJob();
    const job_3 = await getRandomJob();


    // Build Buttons
    const button_1 = new ButtonBuilder()
    .setCustomId(job_1.jobId)
    .setLabel(`${job_1.jobName}`)
    .setStyle(ButtonStyle.Secondary)

    const button_2 = new ButtonBuilder()
    .setCustomId(job_2.jobId)
    .setLabel(`${job_2.jobName}`)
    .setStyle(ButtonStyle.Secondary)
    
    const button_3 = new ButtonBuilder()
    .setCustomId(job_3.jobId)
    .setLabel(`${job_3.jobName}`)
    .setStyle(ButtonStyle.Secondary)

    // Add these to Action Row
    const row = new ActionRowBuilder().addComponents([ button_1, button_2, button_3 ]);

   const response = await interaction.reply(
      {
        content: `Use the buttons below the embed to select one of the specified jobs.`,
        embeds: [
          createCustomEmbed({
            title: `Job Listings`,
            fields: [
              {
                name: `${job_1.jobName} | ${job_1.jobDaily} daily coins`,
                value: `${job_1.jobDescription} With a wage of ${job_1.jobWage} coins.`,
                inline: true
              },
              {
                name: `${job_2.jobName} | ${job_2.jobDaily} daily coins`,
                value: `${job_2.jobDescription} With a wage of ${job_2.jobWage} coins.`,
                inline: true 
              },
              {
                name: `${job_3.jobName} | ${job_3.jobDaily} daily coins`,
                value: `${job_3.jobDescription} With a wage of ${job_3.jobWage} coins.`,
                inline: true
              }
            ]
          })
        ],
        components: [
          row
        ]
      }
    )

        // Collect the button selection
        const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
        const collector = response.createMessageComponentCollector({ options });
        collector.on('collect', async i => {
    
            const selectedButton = i.customId;

            if(selectedButton === job_1.jobId) {
              await postRequest(`/career/${interaction.guildId}/${interaction.user.id}`, { updatedCareers: job_3.jobId });
              i.update({
                content: null,
                embeds: [
                  createCustomEmbed({
                    title: `${interaction.user.username}'s New Job`,
                    fields: [
                    {
                      name: `You chose to be a:`,
                      value: `${job_1.jobName} | ${job_1.jobDescription}`,
                    },
                    {
                      name: `Your job wage is:`,
                      value: `${job_1.jobWage} coins`,
                    },
                    {
                      name: `Your job daily is:`,
                      value: `${job_1.jobDaily} coins`,
                    }
                  ]
                  })
                ],
                components: [],
              })
            }
            if(selectedButton === job_2.jobId) {
              await postRequest(`/career/${interaction.guildId}/${interaction.user.id}`, { updatedCareers: job_2.jobId });
              i.update({
                content: null,
                embeds: [
                  createCustomEmbed({
                    title: `${interaction.user.username}'s New Job`,
                    fields: [
                    {
                      name: `You chose to be a:`,
                      value: `${job_2.jobName} | ${job_2.jobDescription}`,
                    },
                    {
                      name: `Your job wage is:`,
                      value: `${job_2.jobWage} coins`,
                    },
                    {
                      name: `Your job daily is:`,
                      value: `${job_2.jobDaily} coins`,
                    }
                  ]
                  })
                ],
                components: [],
              })
            }
            if(selectedButton === job_3.jobId) {
              await postRequest(`/career/${interaction.guildId}/${interaction.user.id}`, { updatedCareers: job_3.jobId });
              i.update({
                content: null,
                embeds: [
                  createCustomEmbed({
                    title: `${interaction.user.username}'s New Job`,
                    fields: [
                    {
                      name: `You chose to be a:`,
                      value: `${job_3.jobName} | ${job_3.jobDescription}`,
                    },
                    {
                      name: `Your job wage is:`,
                      value: `${job_3.jobWage} coins`,
                    },
                    {
                      name: `Your job daily is:`,
                      value: `${job_3.jobDaily} coins`,
                    }
                  ]
                  })
                ],
                components: [],
              })
            }
        })

  } else {

    // Fetch the daily wage for the job.
    const jobDetails = await getJobDetails(jobId);
    const { daily } = jobDetails;

    // POST the daily wage to the user's balance.
    await postRequest(`/balance/${interaction.guildId}/${interaction.user.id}`, { amount: +daily })

     // Generate a random work response based on that user's jobId.
     interaction.reply({ content: await generateWorkResponse(jobId) });
    
      // Add the user to the cooldowns Collection
      return client.cooldowns.set(cooldownKey, interaction, 24 * 60 * 60) // 3600 minutes 
    }
  } else {
    interaction.reply({
      content: `You are on a cooldown, you can only work once every day.`
    })
  }
}