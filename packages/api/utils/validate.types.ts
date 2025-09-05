export type BalanceType = 'wallet' | 'bank';

export type BalanceQueryParams = {
    sortBy: BalanceType;
    order: 'ASC' | 'DESC';
};

export type BalanceUpdateBody = {
    amount: number;
    type: BalanceType;
    allowNegative?: boolean;
};