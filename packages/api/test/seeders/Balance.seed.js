const { User, Guild, UserBalance } = require("../../database/models");

module.exports.run = async () => {

    const userData = [
        {
            userId: "1042558234566860810", // SEVEN
            balance: 6969,
            guildId: "660103319557111808"
        },
        {
            userId: "377842014290575361", // ZAKARIAX
            balance: 6969,
            guildId: "660103319557111808"
        },
        {
            userId: "438054607571386378", // ZEUSGMJ
            balance: 6969,
            guildId: "660103319557111808"
        },
        {
            userId: "562233152827817984", // THEFALLENSHADE
            balance: 6969,
            guildId: "660103319557111808"
        },
        {
            userId: "1138091030713995344",
            balance: 6969,
            guildId: "660103319557111808",
        }
    ]

    for (const userInfo of userData) {
        try {
            // Check if the guild with the specified guildId exists
                    // User exists get balance
                    const existingBalance = await UserBalance.findOne({
                        where: {
                            userId: userInfo.userId,
                            guildId: userInfo.guildId,
                        }
                    })
                    if(existingBalance) {
                        existingBalance.update(userInfo)
                    } else {
                        UserBalance.create(userInfo)
                    }
        } catch (error) {
            console.error(`Error creating/updating balance: ${error.message}`);
        }
    }

}