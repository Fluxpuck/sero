const {jobResponses} = require("../../../assets/job-messages");
const jsonData = require("../../../../api/test/data/jobs.json");
const {randomInArray} = require("../MathHelpers/arrayHelper");

module.exports = {

/**
 * Generates a work response at random based on the user's job.
 * @param {*} jobId The user's career jobId from the database.
 */
async generateWorkResponse(jobId) {
    const jobData = jsonData.find(job => job);
    const jobDaily = jobData.daily;
    const response = jobResponses[`job_${jobId}`];

    if(response && response.length > 0) {
        const randomResponse = randomInArray(response);

        return randomResponse.replace('{COIN}', jobDaily.toString());
    }
},

/**
 * Get the details of the job a user holds. Data like the daily, wage, name, && description.
 * @param {*} jobId The user's career jobId from the database
 */
async getJobDetails(jobId) {
    const jobData = jsonData.find(job => job);
    const daily = jobData.daily;
    const wage = jobData.wage;
    const name = jobData.name;
    const description = jobData.description;

    return { daily, wage, name, description };

},

/**
 * Fetch a random job and get details like:
 * The name of the job
 * The job ID.
 * The Description of the job.
 * The daily wage of the job.
 * The wage of the job.
 */
async getRandomJob() {
    // > Create a Set to avoid duplicate selections.
    const selectedJobs = new Set()

    // > Fetch the JSON data
    const array = jsonData;
    
    // > Get available jobs if the Set does not contain the jobId.
    const availableJobs = array.filter(job => !selectedJobs.has(job.jobId));

    // > If we run out of jobs, clear the set and allow more objects to enter the set.
    if(availableJobs.length === 0) {
      selectedJobs.clear();
    }

    // > Pluck the job out at random and return information.
    const randomJob = randomInArray(array);

    if(randomJob) {
    // > Add the selected job to the Set.
        selectedJobs.add(randomJob.jobId)
    
    // > Fetch all job data of the selected randomized job.
    const jobId = randomJob ? randomJob.jobId : null;
    const jobName = randomJob ? randomJob.name : null;
    const jobDaily = randomJob ? randomJob.daily : null;
    const jobWage = randomJob ? randomJob.wage : null;
    const jobDescription = randomJob ? randomJob.description : null;
    
    // Return the job details.
    return { jobId, jobName, jobDaily, jobWage, jobDescription };

    } else {
        // > Throw an error if the function fails.
       console.log(`An error occured while fetching a random job!`);
       return null;
    }
}

}