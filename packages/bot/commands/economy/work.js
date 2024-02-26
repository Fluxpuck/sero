const { postRequest, getRequest } = require("../../database/connection");
const {generateWorkResponse, getJobDetails} = require("../../../bot/lib/helpers/EconomyHelpers/EconomyHelper")
const { post } = require("../../../api/routes/career");

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

  // If user does not exist return and create that user's career profile.
    if(!result) {
    await postRequest(`career/new/${interaction.guild.id}/${interaction.user.id}`)
    interaction.reply({
      content: `You did not have a job, but don't fret we assigned you one.`,
      ephemeral: true 
      })

    }
    // Fetch the daily wage for the job.
    const jobDetails = await getJobDetails(jobId);
    const { daily } = jobDetails;

    // POST the daily wage to the user's balance.
    await postRequest(`/balance/${interaction.guildId}/${interaction.user.id}`, { amount: +daily })

     // Generate a random work response based on that user's jobId.
     interaction.reply({ content: await generateWorkResponse(jobId) });
      // Add the user to the cooldowns Collection
      return client.cooldowns.set(cooldownKey, interaction, 24 * 60 * 60) // 3600 minutes 
    } else {
         interaction.reply({
            content: `You can only work once per day!`,
            ephemeral: true
        })
    }
}
