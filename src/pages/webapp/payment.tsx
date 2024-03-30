import WebappLayout from '@/components/WebappLayout'
import useAppAccount from '@/hooks/useAppAccount'
import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { createPaymentRequestTx } from '@/utils/createPaymentRequestTx'
import { unformatId } from '@/utils/formatId'

function Payment(): JSX.Element {

  // アカウント取得
  const { appId, appAccount } = useAppAccount()
  type Inputs = {
    userId: string
  }

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>()

  // SUBMIT LOGIC
  const requestPayment: SubmitHandler<Inputs> = (data) => {
    if (appAccount === undefined) {
      throw new Error('appAccount is not defined')
    }

    const realId = unformatId(data.userId)

    // 支払いリクエストを送信
    createPaymentRequestTx(realId, appId, 1)
      .then(tx => signAndAnnounce(tx, appAccount))
  }

  return (
    <WebappLayout>
      <div className="page-title">TrueIDで決済</div>
      { appAccount === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="box">
          {
            <form onSubmit={handleSubmit(requestPayment)} className="form">
              <div className="flex flex-col">
                <label>
                  TrueIDで支払い
                </label>
                <input
                  {...register("userId", { required: "アカウント名を入力してください" })}
                  className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                  type="text"
                  name="userId"
                  placeholder="hogehoge@true-id"
                  required
                />
              </div>

              <div>1xymの支払いリクエストを送信します</div>
              <div className="text-center">
                <button className="btn">支払いリクエスト</button>
              </div>
            </form>
          }
        </div>
      )}
    </WebappLayout>
  )
}
export default Payment

