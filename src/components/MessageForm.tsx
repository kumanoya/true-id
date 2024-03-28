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
  currencyMosaicID,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { useUserInfo } from '@/store/UserInfoContext'
import { unformatId } from '@/utils/formatId'

function createMessageTx(recipientName: string, rawMessage: string, xym: number, currentUserId: string|null = null): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6 // XYMの分割単位

  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後
  const recipientNameId = new NamespaceId(recipientName)
  const absoluteAmount =
    xym * parseInt("1" + "0".repeat(networkCurrencyDivisibility)) // networkCurrencyDivisibility = 6 => 1[XYM] = 10^6[μXYM]
  const absoluteAmountUInt64 = UInt64.fromUint(absoluteAmount)
  const mosaic = new Mosaic(new MosaicId(currencyMosaicID), absoluteAmountUInt64)
  const mosaics = [mosaic]

  const message = {
    recipientId: recipientName,
    content: rawMessage,
    signerId: currentUserId,
  }

  const plainMessage = PlainMessage.create(JSON.stringify(message)) // 平文メッセージ
  const feeMultiplier = 100

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    //recipientAddress,
    recipientNameId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier)

  return transferTransaction
}

function MessageForm(): JSX.Element {

  const { account, currentUserId } = useUserInfo()

  type Inputs = {
    recipientName: string
    message: string
    xym: number
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const sendMessage: SubmitHandler<Inputs> = (data) => {
    const tx = createMessageTx(unformatId(data.recipientName), data.message, data.xym, currentUserId)
    signAndAnnounce(tx, account)
  }

  return (
    <>
      <div className="box">
        <form onSubmit={handleSubmit(sendMessage)} className="form">
          <div className="text-xl text-center">
            新しいメッセージを送信
          </div>
          <div className="flex flex-col">
            <label>
              宛先ID
            </label>
            <input
              {...register("recipientName", { required: "宛先アドレスを入力してください" })}
              className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
              type="text"
              name="recipientName"
            />
          </div>

          <div className="flex flex-col">
            <label className="w-32">
              メッセージ
            </label>
            <textarea
              {...register("message", { required: "messageを入力してください" })}
              className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none h-20"
              name="message"
            />
          </div>

          <div className="flex flex-col">
            <label className="w-32">
              xym
            </label>
            <input
              {...register("xym", { required: "xymを入力してください" })}
              className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
              type="text"
              name="xym"
            />
          </div>
          <button className="btn">送信</button>
        </form>
      </div>
    </>
  )
}
export default MessageForm

