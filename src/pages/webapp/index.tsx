import WebappLayout from '@/components/WebappLayout';
import useAppAccount from '@/hooks/useAppAccount';
import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createLoginRequestTx } from '@/utils/createLoginRequestTx'
import { unformatId } from '@/utils/formatId'

function Request(): JSX.Element {

  // アカウント取得
  const appAccount = useAppAccount()
  const appId = 'true-id-app-test'

  type Inputs = {
    userId: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const requestAccount: SubmitHandler<Inputs> = (data) => {
    if (appAccount === undefined) {
      return
    }

    // アプリ名はハードコード
    createLoginRequestTx(unformatId(data.userId), appId)
      .then(tx => signAndAnnounce(tx, appAccount))
  }

  return (
    <WebappLayout>
      {appAccount === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="box">
          <form onSubmit={handleSubmit(requestAccount)} className="form">
            アプリ名: { appId }
            <div className="flex flex-col">
              <label>
                TrueIDでログイン
              </label>
              <input
                {...register("userId", { required: "アカウント名を入力してください" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="userId"
              />
            </div>

            <button className="btn">送信</button>
          </form>
        </div>
      )}
    </WebappLayout>
  )
}
export default Request

