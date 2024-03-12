import {
  SignedTransaction,
  Transaction,
} from 'symbol-sdk';
import { createRepositoryFactory } from '@/utils/createRepositoryFactory';

const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
  isAllowedSSS: () => boolean;
}
declare const window: SSSWindow;

export const signAndAnnounce = async (tx: Transaction): Promise<any> => {
  window.SSS.setTransaction(tx);
  //console.log(tx);
  const signedTx: SignedTransaction = await new Promise((resolve) => {
    resolve(window.SSS.requestSign());
  });
  //console.log(signedTx);
  const ret = txRepo.announce(signedTx)
  if (!ret) {
    throw new Error('Colud not announce the transaction');
  }
  return await ret.toPromise();
}

