import FrontLayout from '@/components/FrontLayout';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material'
import {
  Address,
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

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

async function createAccountRequestTx(rootNamespace: string, accountName: string, address: Address): Promise<Transaction>
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment) // デフォルトは2時間後

  const namespaceId = new NamespaceId(rootNamespace)
  const namespaceInfo = await repo.createNamespaceRepository().getNamespace(namespaceId).toPromise()
  if (!namespaceInfo) {
    throw new Error('Invalid root namespace')
  }
  const providerAddress = namespaceInfo.ownerAddress

  const absoluteAmountUInt64 = UInt64.fromUint(0)

  // リクエスト専用のMosaicを送る
  const mosaic = new Mosaic(new MosaicId(accountRegisterMosaicId), absoluteAmountUInt64)
  const mosaics = [mosaic]
  const plainMessage = PlainMessage.create(rootNamespace + ':' + accountName) // 平文メッセージに希望アカウント名とアドレスをエンコード
  const feeMultiplier = 100

  // Create transaction
  const transferTransaction = TransferTransaction.create(
    deadline,
    providerAddress, // namespace宛に送ると管理側での受信処理が複雑になるのでaddressで送る
    //namespaceId,
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

    createAccountRequestTx(data.rootNamespace, data.accountName, address)
      .then(tx => signAndAnnounce(tx))
  }

  return (
    <FrontLayout>

      {address === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="box">
          <Typography component='div' variant='h6' mt={5} mb={1}>
            あなたのアドレス
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(requestAccount)} className="form">
            <div className="flex flex-col">
              <label>
                ルートネームスペース
              </label>
              <input
                {...register("rootNamespace", { required: "アドレスを入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="rootNamespace"
                required
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
                required
              />
            </div>

            <div className="flex justify-center">
              <button className="btn">IDを申請する</button>
            </div>
          </form>
        </div>
      )}
    </FrontLayout>
  )
}
export default Request
