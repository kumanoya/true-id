import FrontLayout from '@/components/FrontLayout';
import { Typography } from '@mui/material'
import useUserAccount from '@/hooks/useUserAccount';
import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createAccountRequestTx } from '@/utils/createAccountRequestTx'
import {
  Account,
} from 'symbol-sdk'
import {
  networkType,
} from '@/consts/blockchainProperty'

function Request(): JSX.Element {

  // アカウント取得
  const userAccount = useUserAccount()

  // 新しいアカウントを作成
  function createAccount(): void {
    const account = Account.generateNewAccount(networkType)
    localStorage.setItem('userPrivateKey', account.privateKey)
  }

  type Inputs = {
    rootNamespace: string
    accountName: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>({
    defaultValues: {
      rootNamespace: 'true-id',
    }
  })

  // SUBMIT LOGIC
  const requestAccount: SubmitHandler<Inputs> = (data) => {
    if (userAccount === undefined) {
      return
    }
    createAccountRequestTx(data.rootNamespace, data.accountName, userAccount.address)
      .then(tx => signAndAnnounce(tx, userAccount))
  }

  return (
    <FrontLayout>

      {userAccount === undefined ? (
        <form onSubmit={createAccount} className="p-4 text-center">
          <div className="p-4">Symbolアドレスが作成されていません</div>
          <button className="btn">Symbolアドレスを作成する</button>
        </form>
      ) : (
        <div className="box">
          <Typography component='div' variant='h6' mt={5} mb={1}>
            あなたのSymbolアドレス
          </Typography>
          { userAccount.address.plain() }
          <form onSubmit={handleSubmit(requestAccount)} className="form">
            <div className="flex flex-col">
              <label>
                IDプロバイダー（ルートネームスペース）
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
