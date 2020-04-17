import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer({ dest: path.resolve(__dirname, '../', '../', 'tmp') });

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository
    .createQueryBuilder('transactions')
    .leftJoinAndSelect('transactions.category', 'category')
    .getMany();

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });

  response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const filePath = request.file.path;
    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute({ filePath });

    response.json(transactions);
  },
);

export default transactionsRouter;
