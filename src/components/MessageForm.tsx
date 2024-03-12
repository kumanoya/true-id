import { Typography } from '@mui/material';
import {
  Deadline,
  UInt64,
  Mosaic,
  MosaicId,
  NamespaceId,
  PlainMessage,
  Transaction,
  TransferTransaction,
} from 'symbol-sdk';

import {
  currencyMosaicID,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

import { useForm, SubmitHandler } from "react-hook-form";

import { signAndAnnounce } from '@/utils/signAndAnnounce';

function createMessageTx(recipientName: string, rawMessage: string, xym: number): Transaction
{
  // XXX: ハードコード
  const networkCurrencyDivisibility = 6; // XYMの分割単位

  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const recipientNameId = new NamespaceId(recipientName);
  const absoluteAmount =
    xym * parseInt("1" + "0".repeat(networkCurrencyDivisibility)); // networkCurrencyDivisibility = 6 => 1[XYM] = 10^6[μXYM]
  const absoluteAmountUInt64 = UInt64.fromUint(absoluteAmount);
  const mosaic = new Mosaic(new MosaicId(currencyMosaicID), absoluteAmountUInt64);
  const mosaics = [mosaic];
  const plainMessage = PlainMessage.create(rawMessage); // 平文メッセージ
  const feeMultiplier = 100;

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    //recipientAddress,
    recipientNameId,
    mosaics,
    plainMessage,
    networkType
  ).setMaxFee(feeMultiplier);

  return transferTransaction;
}

function MessageForm(): JSX.Element {

  type Inputs = {
    recipientName: string;
    message: string;
    xym: number;
  };

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // SUBMIT LOGIC
  const sendMessage: SubmitHandler<Inputs> = (data) => {
    signAndAnnounce(
      createMessageTx(data.recipientName, data.message, data.xym)
    )
  }

  return (
    <>
      <div className="box">
        <Typography component='div' variant='h6' mt={5} mb={1}>
          メッセージ送信
        </Typography>
        <form onSubmit={handleSubmit(sendMessage)} className="form">
          <div className="flex flex-col">
            <label>
              アカウント名
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
              className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none h-80"
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
  );
}
export default MessageForm;

