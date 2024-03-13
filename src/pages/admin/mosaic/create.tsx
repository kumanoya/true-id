import AdminLayout from '@/components/AdminLayout';
import { Typography, Backdrop, CircularProgress } from '@mui/material'

import useAdminAccount from '@/hooks/useAdminAccount';

import { useForm, SubmitHandler } from "react-hook-form"

import { signAndAnnounce } from '@/utils/signAndAnnounce'

import { createMosaicRegistrationAggregateTx } from '@/utils/mosaicTxFactory'

function Request(): JSX.Element {

  // アカウント取得
  const adminAccount = useAdminAccount()

  type Inputs = {
    mosaicName: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const createMosaic: SubmitHandler<Inputs> = (data) => {
    if (adminAccount === undefined) {
      throw new Error('adminAccount is not defined')
    }
    (async () => {
      const aggTx = createMosaicRegistrationAggregateTx(adminAccount.publicAccount, data.mosaicName);
      console.log("aggTx", aggTx)
      await signAndAnnounce(aggTx, adminAccount)
    })()
  }

  return (
    <AdminLayout>
      {adminAccount === undefined ? (
        <Backdrop open={adminAccount === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <div className="box">
          <Typography component='div' variant='h6' mt={5} mb={1}>
            カスタムモザイク作成
          </Typography>
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

