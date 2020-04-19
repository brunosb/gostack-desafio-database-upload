import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    return transactions.reduce(
      (acc, transaction) => {
        const { type, value } = transaction;

        if (type === 'income') {
          acc.income += Number(value);
          acc.total += Number(value);
        } else if (type === 'outcome') {
          acc.outcome += Number(value);
          acc.total -= Number(value);
        }

        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
  }
}

export default TransactionsRepository;
