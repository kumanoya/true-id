import AdminLayout from '@/components/AdminLayout';
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
  accountRegisterMosaicId,
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty'

import useSssInit from '@/hooks/useSssInit'
import useAddressInit from '@/hooks/useAddressInit'

import { useForm, SubmitHandler } from "react-hook-form"

import { signAndAnnounce } from '@/utils/signAndAnnounce'

import { createMosaicRegistrationAggregateTx } from '@/utils/mosaicTxFactory'

function Request(): JSX.Element {

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit()

  // アドレス取得
  const { publicAccount, address } = useAddressInit(clientPublicKey, sssState)

  type Inputs = {
    mosaicName: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const createMosaic: SubmitHandler<Inputs> = (data) => {
    if (address === undefined) {
      return
    }
    if (publicAccount === undefined) {
      return
    }
    (async () => {
      const aggTx = createMosaicRegistrationAggregateTx(publicAccount, data.mosaicName);
      console.log("aggTx", aggTx)
      await signAndAnnounce(aggTx)
    })()
  }

  return (
    <AdminLayout>
      {address === undefined ? (
        <Backdrop open={address === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <div className="box">
          <Typography component='div' variant='h6' mt={5} mb={1}>
            カスタムモザイク作成
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(createMosaic)} className="form">
            <div className="flex flex-col">
              <label>
                モザイク名(Root Namespace)
              </label>
              <input
                {...register("mosaicName", { required: "モザイク名を入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="mosaicName"
              />
            </div>

            <button className="btn">送信</button>
          </form>
        </div>
      )}
    </AdminLayout>
  )
}
export default Request

