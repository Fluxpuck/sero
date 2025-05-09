import { Guild } from '../../models';

export async function seedGuilds() {
    try {
        const guilds = [
            {
                guildId: '660103319557111808',
                guildName: "Fluxpuck's Secret Society",
                premium: false,
            }
        ];

        // Create the guild records in the database
        await Guild.bulkCreate(guilds as Guild[]);
        console.log(`${guilds.length} guilds have been seeded successfully.`);
        return { success: true };

    } catch (error) {
        console.error('Error seeding guilds:', error);
        return { success: false, error };
    }
}
