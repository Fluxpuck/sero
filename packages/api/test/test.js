









const axios = require('axios');
const instance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Authorization': process.env.API_MASTER_KEY,
        "Content-type": "application/json"
    }
});



(async () => {

    // await instance.get('/client/commands')

    await instance.post('/client/command', {
        command: {
            commandId: 43265436345263426,
            commandName: "Leaderboard",
            private: true
        }
    })

    // await instance.get('/guilds')
    //     .then(response => { console.log(response.data) })
    //     .catch(error => console.error(error.response.data.error));

    // await instance.get('/guilds/660103319557111808')
    //     .then(response => { console.log(response.data) })
    //     .catch(error => console.error(error.response.data.error));

    // await instance.post('/users/253740950315204608/972218683277606952', {
    //     user: {
    //         userId: '972218683277606952',
    //         userName: "Krypto#0004"
    //     }
    // }).then(response => console.log(response.data))
    //     .catch(error => console.error(error.response.data.error));

    // await instance.post('/moderators/253740950315204608/972218683277606952', {
    //     moderator: {
    //         location: 'North America',
    //         language: 'English',
    //         rank: 'Moderator'
    //     }
    // }).then(response => console.log(response.data))
    //     .catch(error => console.error(error.response.data.error));

    // await instance.get('/guilds/253740950315204608')
    //     .then(response => { console.log(response.data) })

    // await instance.get('/users/253740950315204608')
    //     .then(response => { console.log(response.data) })

    // await instance.get('/moderators/253740950315204608')
    //     .then(response => { console.log(response.data) })

    // await instance.get('/leaderboard/253740950315204608')
    //     .then(response => { console.log(response.data) })

    // await instance.post('/leaderboard/gain/253740950315204608/270640827787771943')
    //     .then(response => { console.log(response.data) })

    // await instance.get('/leaderboard/253740950315204608/270640827787771943')
    //     .then(response => { console.log(response.data) })
})();




