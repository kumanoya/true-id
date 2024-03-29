import { useForm, SubmitHandler } from "react-hook-form"
import { signAndAnnounce } from '@/utils/signAndAnnounce'
import { useUserInfo } from '@/store/UserInfoContext'
import { unformatId } from '@/utils/formatId'
import createMessageTx from '@/utils/createMessageTx'

function MessageForm(): JSX.Element {

  const { account, currentUserId } = useUserInfo()

  type Inputs = {
    recipientName: string
    message: string
    xym: number
  }

  const defaultValues = {
    recipientName: '',
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
    const tx = createMessageTx(unformatId(data.recipientName), data.message, data.xym, currentUserId)
    signAndAnnounce(tx, account)
    reset()
  }

  return (
    <>
      <form onSubmit={handleSubmit(sendMessage)} className="form">
        <div className="text-xl text-center">
          新しいメッセージを送信
        </div>
        <div className="flex flex-col">
          <label>
            宛先ID
          </label>
          <input
            {...register("recipientName", { required: "宛先アドレスを入力してください" })}
            className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
            type="text"
            name="recipientName"
          />
        </div>

        <div className="flex flex-col">
          <label className="w-32">
            メッセージ
          </label>
          <textarea
            {...register("message", { required: "messageを入力してください" })}
            className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none h-20"
            name="message"
          />
        </div>

        <div className="flex flex-col">
          <label className="w-32">
            xym
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
    </>
  )
}
export default MessageForm

