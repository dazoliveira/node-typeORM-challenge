// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transactionExist = await transactionRepository.findOne(id);
    if (!transactionExist) {
      throw new AppError('Transaction not found', 404);
    }
    transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
