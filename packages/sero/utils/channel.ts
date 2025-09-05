import {
  Channel,
  DMChannel,
  TextChannel,
  NewsChannel,
  ThreadChannel,
} from "discord.js";

export const isTextChannel = (channel: Channel) => {
  return channel.isTextBased() && !(channel instanceof DMChannel);
};

export const isBulkDeletable = (channel: Channel): boolean => {
  return (
    "bulkDelete" in channel &&
    (channel instanceof TextChannel ||
      channel instanceof NewsChannel ||
      channel instanceof ThreadChannel)
  );
};
