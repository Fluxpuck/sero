import { Messages, User } from '../../models';
import { faker } from '@faker-js/faker';
import { logger } from "../../utils/logger";

/**
 * Seed messages with faker to generate realistic content
 */
export async function seedMessages(count = 100) {
    try {
        // Fetch all users from the database
        const users = await User.findAll({
            attributes: ['userId', 'guildId', 'uuid']
        });

        // Set an array of channel IDs to choose from
        const channelIds = [
            '1087368064200343592',
            '660104519031717896',
            '1126983761859457054',
        ]

        // Generate random messages
        const randomMessages = Array.from({ length: count }, () => {
            const randomUser = faker.helpers.arrayElement(users);
            return {
                guildId: randomUser.guildId,
                channelId: faker.helpers.arrayElement(channelIds),
                messageId: faker.string.numeric(10),
                userId: randomUser.userId,
                content: faker.helpers.arrayElement([
                    faker.lorem.sentence(),
                    faker.hacker.phrase(),
                    faker.lorem.paragraph(1),
                    "Hello everyone!",
                    "What's going on?",
                    "I need help with something",
                    "This is a test message"
                ]),
                createdAt: faker.date.between({
                    from: new Date('2025-01-01'),
                    to: new Date('2025-05-09')
                })
            };
        });

        await Messages.bulkCreate(randomMessages as Messages[]);
        logger.success(`${count} messages have been seeded successfully.`);
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error seeding messages: ${errorMessage}`);
        return { success: false, error };
    }

}
