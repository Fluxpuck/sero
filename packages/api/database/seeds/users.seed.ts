import { User } from '../../models';
import { UserType } from '../../models/user.model';

export async function seedUsers(): Promise<{ success: boolean; error?: unknown }> {
    const users = [
        {
            userId: '270640827787771943',
            guildId: '660103319557111808',
            username: "fluxpuck",
            premium: true,
            userType: UserType.ADMIN
        },
        {
            userId: '219371358927192064',
            guildId: '660103319557111808',
            username: "thefallenshade",
            premium: false,
            userType: UserType.MODERATOR
        },
        {
            userId: '427614787845881877',
            guildId: '660103319557111808',
            username: "amy_y",
            premium: false,
            userType: UserType.USER
        },
        {
            userId: '377842014290575361',
            guildId: '660103319557111808',
            username: "zakaria",
            premium: false,
            userType: UserType.USER
        },
    ];

    try {
        await User.bulkCreate(users as User[], { individualHooks: true });
        console.log(`${users.length} users(s) have been seeded successfully.`);
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error seeding users: ${errorMessage}`);
        return { success: false, error };
    }

}
