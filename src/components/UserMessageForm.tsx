import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { useUserInfo } from '@/store/UserInfoContext'
import createMessageTx from '@/utils/createMessageTx'

interface Props { recipientId: string }
function UserMessageForm({ recipientId }: Props): JSX.Element {

  const { account, currentUserId } = useUserInfo()

  type Inputs = {
    content: string
    xym: number
  }

  const defaultValues = {
    content: '',
    xym: 0,
  }

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<Inputs>({ defaultValues })

  // SUBMIT LOGIC
  const sendMessage: SubmitHandler<Inputs> = (data) => {
    const tx = createMessageTx(recipientId, data.content, data.xym, currentUserId)
    signAndAnnounce(tx, account)
    reset()
  }

  return (
    <>
      <div className="box">
        <form onSubmit={handleSubmit(sendMessage)} className="form">
          <div className="text-xl text-center">
            メッセージ送信
          </div>
          <div className="flex flex-col">
            <label className="w-32">
              メッセージ
            </label>
            <textarea
              {...register("content", { required: "メッセージを入力してください" })}
              className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none h-20"
              name="content"
            />
          </div>

          <div className="flex flex-col">
            <label className="w-32">
              送金(xym)
            </label>
            <input
              {...register("xym", { required: "xymを入力してください" })}
              className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
              type="text"
              name="xym"
            />
          </div>
          <button className="btn">送信</button>
        </form>
      </div>
    </>
  )
}
export default UserMessageForm

