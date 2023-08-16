/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

const axios = require('axios');
module.exports.run = async () => {
    // → connection to the API
    const instance = axios.create({
        baseURL: 'http://localhost:3000/api',
        headers: {
            'Authorization': '000123',
            "Content-type": "application/json"
        }
    });

    // → add guild
    await instance.post('/guilds/253740950315204608', {
        guild: {
            guildId: '660103319557111808',
            guildName: 'Fluxpucks Secret Society'
        }
    }).then(response => console.log(response.data))
        .catch(error => console.error(error.response.data.error));

    // → add user 1
    await instance.post('/users/660103319557111808/270640827787771943', {
        user: {
            userId: '270640827787771943',
            userName: "Fluxpuck#0001"
        }
    }).then(response => console.log(response.data))
        .catch(error => console.error(error.response.data.error));

    // → add user 2
    await instance.post('/users/660103319557111808/219371358927192064', {
        user: {
            userId: '219371358927192064',
            userName: "TheFallenShade#5557"
        }
    }).then(response => console.log(response.data))
        .catch(error => console.error(error.response.data.error));

    // → add user 1 to moderators
    await instance.post('/moderators/660103319557111808/270640827787771943', {
        moderator: {
            location: 'Europe',
            language: 'English',
            rank: 'Moderator'
        }
    }).then(response => console.log(response.data))
        .catch(error => console.error(error.response.data.error));

    // → add user 1 to levels
    await instance.post('/leaderboard/660103319557111808/270640827787771943')
        .then(response => console.log(response.data))
        .catch(error => console.error(error.response.data.error));

    // → add experience to user 1
    await instance.post('/leaderboard/gain/660103319557111808/270640827787771943')
        .then(response => console.log(response.data))
        .catch(error => console.error(error.response.data.error));

}