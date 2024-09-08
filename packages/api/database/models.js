const { sequelize } = require('../database/sequelize')

const models = {
    Commands: require('../models/commands.model')(sequelize),
    Levels: require('../models/levels.model')(sequelize),
    Guild: require('../models/guild.model')(sequelize),
    User: require('../models/user.model')(sequelize),
    UserActivities: require('../models/user_activities.model')(sequelize),
    UserLevels: require('../models/user_levels.model')(sequelize),
    UserBalance: require('../models/user_balance.model')(sequelize),
    UserCareers: require('../models/user_careers.model')(sequelize),
    Away: require('../models/away.model')(sequelize),
    Jobs: require('../models/jobs.model')(sequelize),
    Messages: require('../models/messages.model')(sequelize),
    LevelRanks: require('../models/level_ranks.model')(sequelize),
    LogChannels: require('../models/log_channels.model')(sequelize),
    Logs: require('../models/logs.model')(sequelize),
    Work_snapshot: require('../models/work_snapshot.model')(sequelize),
    _Requests: require('../models/_requests.model')(sequelize),
}

Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => { model.associate(models); });

module.exports = { ...models }