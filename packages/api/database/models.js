/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Import all Models
const { sequelize } = require('../database/sequelize')

const models = {
    Client: require('../models/client.model')(sequelize),
    Commands: require('../models/commands.model')(sequelize),
    Guild: require('../models/guild.model')(sequelize),
    User: require('../models/user.model')(sequelize),
    Moderator: require('../models/moderator.model')(sequelize),
    Messages: require('../models/messages.model')(sequelize),
    Levels: require('../models/levels.model')(sequelize),
    EventChannels: require('../models/eventchannels.model')(sequelize),
    AuditLogs: require('../models/auditlogs')(sequelize),
}

// → setup associations between models
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => { model.associate(models); });

// → Export Models
module.exports = { ...models }