import { isFinite, isNumber, isEqual } from 'lodash';
import { BalanceType } from './validate.types';

/**
 * Validates if an amount is a valid non-zero number
 * @param amount The amount to validate
 * @returns Validation result with success status and optional error message
 */
export const validateAmount = (amount: number): { valid: boolean; message?: string } => {
    if (!isFinite(amount) || !isNumber(amount)) {
        return { valid: false, message: 'Amount must be a valid finite number' };
    }

    if (isEqual(amount, 0)) {
        return { valid: false, message: 'Amount cannot be zero' };
    }

    return { valid: true };
};

/**
 * Validates if the balance type is valid
 * @param type The balance type to validate
 * @param allowBoth Whether to allow "both" as a valid type
 * @returns Validation result with success status and optional error message
 */
export const validateBalanceType = (type: string, allowBoth = false): { valid: boolean; message?: string } => {
    if (type !== 'wallet' && type !== 'bank' && !allowBoth) {
        return { valid: false, message: 'Type must be either "wallet" or "bank"' };
    }

    return { valid: true };
};