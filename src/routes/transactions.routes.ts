import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactionList = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();
  const transactionListWithBalance = {
    transactions: [...transactionList],
    balance: {
      ...balance,
    },
  };
  return response.status(200).json(transactionListWithBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionsService = new CreateTransactionService();
  const transaction = await createTransactionsService.execute({
    title,
    value,
    type,
    category,
  });
  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionService = new DeleteTransactionService();
  await transactionService.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();
    const transactionList = await importTransactionService.execute(
      request.file.path,
    );
    return response.status(200).json(transactionList);
  },
);

export default transactionsRouter;
