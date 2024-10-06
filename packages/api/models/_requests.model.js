const { Sequelize, Model, DataTypes } = require('sequelize');
const cron = require('node-cron');

class _Requests extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    _Requests.init({
        method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        responseTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        body: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: '_requests',
        timestamps: true,
        createdAt: true
    });

    // Clear old request logs every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const result = await _Requests.destroy({
                where: {
                    createdAt: {
                        [Sequelize.Op.lt]: threeMonthsAgo
                    }
                }
            });

            if (result > 0 && process.env.NODE_ENV === "production") {
                console.log(`Cleared ${result} old request logs`);
            }

        } catch (error) {
            console.error('Error deleting old request logs:', error);
        }
    });

    return _Requests;
}
