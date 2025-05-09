import { Messages } from '../../models';
import { faker } from '@faker-js/faker';

/**
 * Seed messages with faker to generate realistic content
 */
export async function seedMessages(count = 50) {
    try {
        console.log(`Seeding ${count} random messages...`);        // Define the guild, channel, and user IDs to use for seeding

        const guildIds = [
            '660103319557111808'
        ];
        const channelIds = [
            '1087368064200343592',
            '660104519031717896',
            '1126983761859457054'
        ];
        const userIds = [
            '270640827787771943',
            '219371358927192064',
            '427614787845881877',
            '377842014290575361'
        ];

        // Generate random messages
        const randomMessages = Array.from({ length: count }, () => {            // Generate a messageId that will fit within safe JS number range
            const randomMessageId = faker.number.int({ min: 1000000000, max: 9999999999 }).toString();

            return {
                guildId: faker.helpers.arrayElement(guildIds),
                channelId: faker.helpers.arrayElement(channelIds),
                messageId: randomMessageId,
                userId: faker.helpers.arrayElement(userIds),
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

        // Clear existing data (optional)
        try {
            await Messages.destroy({ where: {}, force: true });
        } catch (clearError) {
            console.warn('Could not clear existing messages:', clearError instanceof Error ? clearError.message : String(clearError));
        }

        // Bulk insert all message data
        try {
            await Messages.bulkCreate(randomMessages as any);
        } catch (createError) {
            console.error('Error during bulk creation:', createError instanceof Error ? createError.message : String(createError));
            throw createError;  // Re-throw to be caught by the outer try-catch
        }

        console.log('Random messages seeded successfully!');
        return { success: true, count };

    } catch (error) {
        console.error('Error seeding random messages:', error);
        return { success: false, error };
    }
}
