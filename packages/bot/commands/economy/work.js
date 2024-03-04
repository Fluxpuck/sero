const { postRequest, getRequest } = require("../../database/connection");

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

  /*
  
  1. Fetch snapshot from the user
  - If no snapshot, or the snapshot is older than 1 day - 24 hours, continue

  2. Fetch the user's career (job)
- If no career, return message to the user to get a job using /job

  3. Calculate the income based on a calculateIncome function using the wage and the user's level

  FUNCTION EXPLANATIONS:
  50000 / 365 = 136.986301369863
  137 / 100% = 1.37
  1.37 * (1.8 * 12) = 29.664
  137 + 15 = 152


  90000 / 365 = 246.575342465753
  247 / 100% = 2.47
  2.47 * (1 * 12) = 29.64

  */



}