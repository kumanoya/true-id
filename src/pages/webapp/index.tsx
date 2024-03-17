import { Backdrop, CircularProgress } from '@mui/material'
import WebappLayout from '@/components/WebappLayout';
import {
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  NamespaceId,
  PlainMessage,
  Transaction,
  TransferTransaction,
} from 'symbol-sdk'

import {
  loginRequestMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

import useAppAccount from '@/hooks/useAppAccount';

import { useForm, SubmitHandler } from "react-hook-form"

import { signAndAnnounce } from '@/utils/signAndAnnounce'

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

async function createLoginRequestTx(accountName: string): Promise<Transaction>
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // リクエスト専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(loginRequestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(accountName)
  const feeMultiplier = 100

  // 宛先アドレスを取得
  // namespace宛に送ると受信側での受信処理が複雑になる(アドレスで絞り込みできない)のでaddressで送る
  const namespaceId = new NamespaceId(accountName)
  const namespaceInfo = await repo.createNamespaceRepository().getNamespace(namespaceId).toPromise()
  if (!namespaceInfo) {
    throw new Error('Invalid root namespace')
  }
  const recipientAddress = namespaceInfo.ownerAddress

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    recipientAddress, //namespaceId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

function Request(): JSX.Element {

  // アカウント取得
  const appAccount = useAppAccount()

  type Inputs = {
    accountName: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const requestAccount: SubmitHandler<Inputs> = (data) => {
    if (appAccount === undefined) {
      return
    }

    createLoginRequestTx(data.accountName)
      .then(tx => signAndAnnounce(tx, appAccount))
  }

  return (
    <WebappLayout>
      {appAccount === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="box">
          <form onSubmit={handleSubmit(requestAccount)} className="form">

            <div className="flex flex-col">
              <label>
                TrueIDでログイン
              </label>
              <input
                {...register("accountName", { required: "アカウント名を入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="accountName"
              />
            </div>

            <button className="btn">送信</button>
          </form>
        </div>
      )}
    </WebappLayout>
  )
}
export default Request

