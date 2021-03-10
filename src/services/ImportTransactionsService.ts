import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const transactions: Transaction[] = [];
    parseCSV.on('data', async line => {
      const filledTransactions = await createTransactionService.execute({
        title: line[0],
        type: line[1],
        category: line[3],
        value: line[2],
      });
      transactions.push(filledTransactions);
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
