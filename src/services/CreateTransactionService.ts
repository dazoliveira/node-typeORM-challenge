// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

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
    const transactionRepository = getCustomRepository(TransactionRepository);
    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }
    const categoryRepository = getRepository(Category);
    const findedCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    let transaction;
    if (findedCategory) {
      transaction = transactionRepository.create({
        title,
        value,
        type,
        category: findedCategory,
      });
    } else {
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);

      transaction = transactionRepository.create({
        title,
        value,
        type,
        category: newCategory,
      });
    }

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
