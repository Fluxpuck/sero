import { Guild } from '../../models';


export async function seedGuilds(): Promise<{ success: boolean; error?: unknown }> {
    const guilds = [
        {
            guildId: '660103319557111808',
            guildName: "Fluxpuck's Secret Society",
            premium: false,
        },
    ];

    try {
        await Guild.bulkCreate(guilds as Guild[]);

    } catch (error) {
        console.error('Error seeding guilds:', error);
        return { success: false, error };

    } finally {
        console.log(`${guilds.length} guild(s) have been seeded successfully.`);
        return { success: true };
    }

}
