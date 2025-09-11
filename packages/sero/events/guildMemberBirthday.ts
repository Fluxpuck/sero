import { Client, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";
import { getRequest, postRequest } from "../database/connection";
import { UserBirthdayData } from "../types/models/user-birthday.types";
import { ResponseStatus } from "../types/response.types";

const log = logger("guild-member-birthday");

type BirthdayData = {
  guildId: string;
  channelId: string;
  birthdays: UserBirthdayData[];
  roleId: string;
};

const event: Event = {
  name: RedisChannel.GUILD_MEMBER_BIRTHDAY,
  once: false,
  async execute(message: BirthdayData, client: Client): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    log.debug("Processing birthday message", message);

    try {
      const guild = await client.guilds.fetch(message.guildId);
      if (!guild) return;

      const channel = await client.channels.fetch(message.channelId);
      const textChannel = channel as TextChannel | NewsChannel | ThreadChannel;
      if (!channel || !textChannel) return;

      const birthdayRole = await guild.roles.fetch(message.roleId);
      if (!birthdayRole) return;

      // Loop through each birthday
      for (const birthday of message.birthdays) {
        // Fetch the member
        const member = await guild.members.fetch(birthday.userId);
        if (!member) continue;

        // Fetch the template birthday message and store temporary role data
        const [birthdayMessageData, tempRoleResponse] = await Promise.all([
          getRequest(
            `/assets/template-messages/random/${
              birthday.age ? "birthday-with-age" : "birthday"
            }`
          ),
          postRequest(`/guild/${guild.id}/temp-role/${member.id}`, {
            roleId: birthdayRole.id,
            duration: 86400, // 1 day
          }),
        ]);

        if (tempRoleResponse.status == ResponseStatus.SUCCESS) {
          log.debug(
            `Stored temporary role for ${member.id} in guild ${guild.id}`,
            tempRoleResponse.data
          );
        } else {
          log.error(
            `Failed to store temporary role for ${member.id} in guild ${guild.id}`,
            tempRoleResponse.message
          );
        }

        // Send birthday message
        const birthdayMessage = birthdayMessageData?.data?.message;
        // Get birthday message with placeholders replaced
        const birthdayMessageReplaced = birthdayMessage
          ? birthdayMessage
              .replace(/{NAME}/g, `<@${member.id}>`)
              .replace(/{AGE}/g, birthday.age?.toString() || "")
          : `Happy Birthday <@${member.id}>! 🎉`;

        // Send birthday message
        await textChannel.send(birthdayMessageReplaced);

        // Gift the birthday role to the member
        await member.roles.add(birthdayRole);
        log.debug(`Added birthday role to ${member.user.username}`);
      }
    } catch (error) {
      log.error(`Error processing birthday message`, error);
    }
  },
};

export default event;
