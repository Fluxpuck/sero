import {
  Client,
  Guild,
  GuildMember,
  NewsChannel,
  Role,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";
import { getRequest, postRequest } from "../database/connection";
import { UserBirthday } from "../types/models/user-birthday.types";
import { ResponseStatus } from "../types/response.types";

type BirthdayData = {
  guildId: string;
  channelId: string;
  birthdays: UserBirthday[];
  roleId: string;
};

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_BIRTHDAY,
  once: false,
  async execute(message: BirthdayData, client: Client): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    logger.debug("Processing birthday message", message);

    try {
      const guild = client.guilds.cache.get(message.guildId) as Guild;
      if (!guild) return;

      const channel = guild.channels.cache.get(message.channelId) as
        | TextChannel
        | NewsChannel
        | ThreadChannel;
      if (!channel) return;

      const birthdayRole = guild.roles.cache.get(message.roleId) as Role;
      if (!birthdayRole) return;

      // Loop through each birthday
      for (const birthday of message.birthdays) {
        const member = guild.members.cache.get(birthday.userId) as GuildMember;
        if (!member) continue;

        if (birthdayRole) {
          if (!member.roles.cache.has(birthdayRole.id)) {
            // Gift the birthday role to the member
            await member.roles.add(birthdayRole);

            const [birthdayMessageData, tempRoleResponse] = await Promise.all([
              getRequest(
                `/guild/${guild.id}/assets/template-messages/random/${
                  birthday.age ? "birthday-with-age" : "birthday"
                }`
              ),
              postRequest(`/guild/${guild.id}/temp-role/${member.id}`, {
                roleId: birthdayRole.id,
                duration: 86400, // 1 day
              }),
            ]);

            if (tempRoleResponse.status == ResponseStatus.SUCCESS) {
              logger.debug(
                `User ${member.id} claimed reward in guild ${guild.id}`
              );
            } else {
              logger.error(
                `Failed to claim reward for user ${member.id} in guild ${guild.id}`,
                tempRoleResponse.message
              );
            }

            // Send birthday message
            const birthdayMessage =
              birthdayMessageData?.data?.message || "Happy Birthday {{USER}}!";
            await channel.send(
              birthdayMessage
                .replace("{{USER}}", `<@${member.id}>`)
                .replace("{{AGE}}", birthday.age?.toString() || "")
            );

            logger.debug(`Added birthday role to ${member.user.username}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Error processing birthday message: ${error}`);
    }
  },
};

export default event;
