import React, { useEffect, useState } from 'react'
import FrontLayout from '@/components/FrontLayout'

import { useForm, SubmitHandler } from "react-hook-form"

function Home(): JSX.Element {

  const { register, handleSubmit, setValue, reset } = useForm();

  // ローカルストレージから値を取得してフォームにセットする
  useEffect(() => {
    setValue('adminPrivateKey', localStorage.getItem('adminPrivateKey') || '');
    setValue('userPrivateKey', localStorage.getItem('userPrivateKey') || '');
    setValue('appPrivateKey', localStorage.getItem('appPrivateKey') || '');
  }, [setValue]);

  // Save Logic
  const save = (data: any) => {
    localStorage.setItem('adminPrivateKey', data.adminPrivateKey)
    localStorage.setItem('userPrivateKey', data.userPrivateKey)
    localStorage.setItem('appPrivateKey', data.appPrivateKey)
    alert('設定をlocalStorageに保存しました')
  }

  const clear = () => {
    reset()
    localStorage.removeItem('adminPrivateKey')
    localStorage.removeItem('userPrivateKey')
    localStorage.removeItem('appPrivateKey')
  }

  return (
    <FrontLayout>
      <h1 className="m-4 text-xl">
        秘密鍵設定
      </h1>
      <form onSubmit={handleSubmit(save)} className="form">
        <div className="flex flex-col">
          <label className="w-60">ネームスペース管理者 秘密鍵</label>
          <input
            {...register("adminPrivateKey", { required: "入力してください" })}
            className="rounded-md border px-3 py-2"
            type="text"
            name="adminPrivateKey"
          />
        </div>
        <div className="flex flex-col">
          <label className="w-60">一般ユーザー 秘密鍵</label>
          <input
            {...register("userPrivateKey", { required: "入力してください" })}
            className="rounded-md border px-3 py-2"
            type="text"
            name="userPrivateKey"
          />
        </div>
        <div className="flex flex-col">
          <label className="w-60">ウェブアプリ 秘密鍵</label>
          <input
            {...register("appPrivateKey", { required: "入力してください" })}
            className="rounded-md border px-3 py-2"
            type="text"
            name="appPrivateKey"
          />
        </div>
        <div className="flex justify-between">
          <button className="btn">保存</button>
          <button className="btn-clear" onClick={clear}>クリア</button>
        </div>
      </form>
    </FrontLayout>
  )
}
export default Home

