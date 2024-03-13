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

import useSssInit from '@/hooks/useSssInit'
import useAddressInit from '@/hooks/useAddressInit'

import { useForm, SubmitHandler } from "react-hook-form"

import { signAndAnnounce } from '@/utils/signAndAnnounce'

function createLoginRequestTx(accountName: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // リクエスト専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(loginRequestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(accountName + 'でのログインを許可しますか？')
  const feeMultiplier = 100

  // Create transaction
  const namespaceId = new NamespaceId(accountName)
  const transferTransaction = TransferTransaction.create(
    deadline,
    namespaceId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

function Request(): JSX.Element {

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit()

  // アドレス取得
  const { publicAccount, address } = useAddressInit(clientPublicKey, sssState)

  type Inputs = {
    accountName: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const requestAccount: SubmitHandler<Inputs> = (data) => {
    if (address === undefined) {
      return
    }
    if (publicAccount === undefined) {
      return
    }
    signAndAnnounce(
      createLoginRequestTx(data.accountName)
    )
  }

  return (
    <WebappLayout>
      {address === undefined ? (
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

