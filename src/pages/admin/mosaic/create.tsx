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

import { createRootMosaicAliasTx, createRootMosaicRegistrationTx } from '@/utils/mosaicTxFactory'
import { createRootNamespaceRegistrationTx } from '@/utils/namespaceTxFactory'
import { aggregateTx } from '@/utils/aggregateTx';

function createRootMosaicTx(rootNamespace: string, mosaicName: string, accountRawAddress: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後
  //const providerAddress = Address.createFromRawAddress(rootNamespace)
  const namespaceId = new NamespaceId(rootNamespace)
  const absoluteAmountUInt64 = UInt64.fromUint(0)

  // リクエスト専用のMosaicを送る
  const mosaic = new Mosaic(new MosaicId(requestMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(mosaicName + ':' + accountRawAddress) // 平文メッセージに希望アカウント名とアドレスをエンコード
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
      const mosaicAggTx = createRootMosaicRegistrationTx(publicAccount);
      const namespaceTx = createRootNamespaceRegistrationTx(data.mosaicName);
      const aliasTx = createRootMosaicAliasTx(data.mosaicName, new MosaicId("25132742207E760C"))
      mosaicAggTx.addTransactions([
        namespaceTx.toAggregate(publicAccount),
        aliasTx.toAggregate(publicAccount),
      ])
      signTx(mosaicAggTx)
    })()
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
          <Typography component='div' variant='h6' mt={5} mb={1}>
            カスタムモザイク作成
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(createMosaic)} className="m-4 px-8 py-4 border w-full max-w-80 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                モザイク名
              </label>
              <input
                {...register("mosaicName", { required: "モザイク名を入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="mosaicName"
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
