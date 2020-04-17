import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Outcome not avaliable!', 400);
    }

    const checkCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryChecked;
    if (checkCategoryExists) {
      categoryChecked = checkCategoryExists;
    } else {
      categoryChecked = await categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryChecked);
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryChecked.id,
      category: categoryChecked,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
