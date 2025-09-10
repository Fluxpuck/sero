import { Transaction } from "sequelize";
import { Response } from "express";
import { ResponseHandler } from "./response.utils";
import { ResponseCode } from "./response.types";
import { Guild } from "../models";

/**
 * Checks if a guild has premium and returns a boolean value.
 * If the guild does not have premium, it sends an error response and returns false.
 * If the guild has premium, it returns true.
 */
export const checkGuildPremium = async (
  guildId: string,
  transaction: Transaction,
  res: Response
): Promise<boolean> => {
  // Check if guild has premium
  const guild = await Guild.findOne({ where: { guildId } });
  if (!guild || !guild.hasPremium()) {
    await transaction.rollback();
    ResponseHandler.sendError(
      res,
      "This guild does not have premium. Level updates are disabled.",
      ResponseCode.PREMIUM_REQUIRED
    );
    return false;
  }
  return true;
};
