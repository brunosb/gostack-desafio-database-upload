import fs from 'fs';
import csv from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

import AppError from '../errors/AppError';

interface Request {
  filePath: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const transactions = [] as Transaction[];
    await fs.createReadStream(filePath).pipe(
      csv({ columns: true, from_line: 1, trim: true })
        .on('data', async row => {
          const transaction = await createTransactionService.execute(row);
          transactions.push(transaction);
        })
        .on('end', () => {
          fs.unlinkSync(filePath);
        })
        .on('error', err => {
          throw new AppError(err.message);
        }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
