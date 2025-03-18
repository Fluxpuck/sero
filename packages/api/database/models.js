const { sequelize } = require('../database/sequelize');

const models = {
    Commands: require('../models/commands.model')(sequelize),
    Levels: require('../models/levels.model')(sequelize),
    Jobs: require('../models/jobs.model')(sequelize),
    Guild: require('../models/guild.model')(sequelize),
    GuildSettings: require('../models/guild_settings.model')(sequelize),
    LevelRanks: require('../models/level_ranks.model')(sequelize),
    User: require('../models/user.model')(sequelize),
    UserActivities: require('../models/user_activities.model')(sequelize),
    UserWallet: require('../models/user_wallet.model')(sequelize),
    UserBank: require('../models/user_bank.model')(sequelize),
    UserBirthday: require('../models/user_birthday.model')(sequelize),
    UserCareers: require('../models/user_careers.model')(sequelize),
    UserLevels: require('../models/user_levels.model')(sequelize),
    Away: require('../models/away.model')(sequelize),
    TempRoles: require('../models/temp_roles.model')(sequelize),
    Messages: require('../models/messages.model')(sequelize),
    Logs: require('../models/logs.model')(sequelize),
    TempRoles: require('../models/temp_roles.model')(sequelize),
    ScheduledBoosts: require('../models/scheduled_boosts.model')(sequelize),
    _Requests: require('../models/_requests.model')(sequelize),
}

Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => { model.associate(models); });

module.exports = { ...models }
