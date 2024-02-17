import {
  SignedTransaction,
  Transaction,
} from 'symbol-sdk';
import { firstValueFrom } from "rxjs";
import { createRepositoryFactory } from '@/utils/createRepositoryFactory';

const repo = createRepositoryFactory();
const txRepo = repo.createTransactionRepository();

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
  isAllowedSSS: () => boolean;
}
declare const window: SSSWindow;

export const signTx = async (tx: Transaction): Promise<void> => {
  window.SSS.setTransaction(tx);
  //console.log(tx);
  const signedTx: SignedTransaction = await new Promise((resolve) => {
    resolve(window.SSS.requestSign());
  });
  //console.log(signedTx);
  await firstValueFrom(txRepo.announce(signedTx));
}

