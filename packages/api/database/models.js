const { sequelize } = require('../database/sequelize')

const models = {
    ConfigFlags: require('../models/config.model')(sequelize),
    Commands: require('../models/commands.model')(sequelize),
    Guild: require('../models/guild.model')(sequelize),
    User: require('../models/user.model')(sequelize),
    Moderator: require('../models/moderator.model')(sequelize),
    Messages: require('../models/messages.model')(sequelize),
    Levels: require('../models/levels.model')(sequelize),
    EventChannels: require('../models/eventchannels.model')(sequelize),
    AuditLogs: require('../models/auditlogs.model')(sequelize),
}

Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => { model.associate(models); });

module.exports = { ...models }