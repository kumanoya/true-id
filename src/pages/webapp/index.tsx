import React, { useState } from 'react'
import LeftDrawer from '@/components/LeftDrawer'
import Header from '@/components/Header'
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

function createLoginRequestTx(accountName: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  // リクエスト専用のMosaicを送る
  const absoluteAmountUInt64 = UInt64.fromUint(0)
  const mosaic = new Mosaic(new MosaicId(requestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(accountName)
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
    signTx(
      createLoginRequestTx(data.accountName)
    )
  }

  //View共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false) //LeftDrawerの設定
  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />

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
          <form onSubmit={handleSubmit(requestAccount)} className="m-4 px-8 py-4 border w-full max-w-80 flex flex-col gap-4">

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

            <button>送信</button>
          </form>
        </Box>
      )}
    </>
  )
}
export default Request

