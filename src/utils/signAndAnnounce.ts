import {
  SignedTransaction,
  Transaction,
  Account,
} from 'symbol-sdk'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'

const repo = createRepositoryFactory()
const txRepo = repo.createTransactionRepository()

//SSS用設定
interface SSSWindow extends Window {
  SSS: any
  isAllowedSSS: () => boolean
}
declare const window: SSSWindow

export const signTx = async (tx: Transaction, signer: Account | null = null): Promise<any> => {

  let signedTx: SignedTransaction

  if (signer) {
    const generationHash = await repo.getGenerationHash().toPromise()
    signedTx = signer.sign(tx, generationHash as string)
  } else {
    window.SSS.setTransaction(tx)
    signedTx = await new Promise((resolve) => {
      resolve(window.SSS.requestSign())
    })
  }

  return signedTx
}

export const signAndAnnounce = async (tx: Transaction, signer: Account | null = null): Promise<any> => {
  const signedTx = await signTx(tx, signer)
  const ret = txRepo.announce(signedTx)
  if (!ret) {
    throw new Error('Transaction not announced')
  }
  return await ret.toPromise()
}

