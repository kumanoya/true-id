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
      <div className="page-title">ユーザーID申請</div>

      {userAccount === undefined ? (
        <form onSubmit={createAccount} className="text-center">
          <div className="p-4">Symbolアドレスが作成されていません</div>
          <button className="btn">Symbolアドレスを作成する</button>
        </form>
      ) : (
        <div className="box">
          <Typography component='div' variant='h6' mb={1}>
            あなたのSymbolアドレス
          </Typography>
          { userAccount.address.plain() }
          <form onSubmit={handleSubmit(requestAccount)} className="mt-4 form">
            <div className="flex flex-col">
              <label className="mb-2">
                希望するID @ プロバイダ名（ルートネーム）
              </label>
              <div>
                <input
                  {...register("accountName", { required: "アカウント名を入力してください" })}
                  className="w-40 rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                  type="text"
                  name="accountName"
                  required
                  placeholder="dummy-id"
                />&nbsp;@&nbsp;
                <input
                  {...register("rootNamespace", { required: "プロバイダ名を入力してください" })}
                  className="w-32 rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                  type="text"
                  name="rootNamespace"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button className="btn">ユーザーIDを取得する</button>
            </div>
          </form>
        </div>
      )}
    </FrontLayout>
  )
}
export default Request
