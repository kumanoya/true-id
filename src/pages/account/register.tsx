import Layout from '@/components/Layout';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material'
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
  requestMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

import useSssInit from '@/hooks/useSssInit'
import useAddressInit from '@/hooks/useAddressInit'

import { useForm, SubmitHandler } from "react-hook-form"

import { signTx } from '@/utils/signTx'

function createAccountRequestTx(rootNamespace: string, accountName: string, accountRawAddress: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後
  //const providerAddress = Address.createFromRawAddress(rootNamespace)
  const namespaceId = new NamespaceId(rootNamespace)
  const absoluteAmountUInt64 = UInt64.fromUint(0)

  // リクエスト専用のMosaicを送る
  const mosaic = new Mosaic(new MosaicId(requestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(accountName + ':' + accountRawAddress) // 平文メッセージに希望アカウント名とアドレスをエンコード
  const feeMultiplier = 100

  // Create transaction
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
    rootNamespace: string
    accountName: string
    accountRawAddress: string
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
    signTx(
      createAccountRequestTx(data.rootNamespace, data.accountName, data.accountRawAddress)
    )
  }

  return (
    <Layout>

      {address === undefined ? (
        <Backdrop open={address === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            あなたのアドレス
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(requestAccount)} className="m-4 px-8 py-4 border w-full max-w-80 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                ルートネームスペース
              </label>
              <input
                {...register("rootNamespace", { required: "アドレスを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="rootNamespace"
              />
            </div>

            <div className="flex flex-col">
              <label>
                希望するアカウント名
              </label>
              <input
                {...register("accountName", { required: "アカウント名を入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="accountName"
              />
            </div>

            <div className="flex flex-col">
              <label>
                割当先アドレス
              </label>
              <input
                {...register("accountRawAddress", { required: "アドレスを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="accountRawAddress"
              />
            </div>

            <button>送信</button>
          </form>
        </Box>
      )}
    </Layout>
  )
}
export default Request
