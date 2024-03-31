import React, { useEffect, useState } from 'react'
import CommonLayout from '@/components/CommonLayout'

import { useForm, SubmitHandler } from "react-hook-form"

function Home(): JSX.Element {

  const defaultValues = {
    adminPrivateKey: '37A59ACF493159C2E1A45D91AAAA68FA7558B444D72DE7B2482ADD63ABC23529',
    userPrivateKey: 'E04CB2BDDF4E38A530A16B6E36BB9086E7E0FAAA6185C64C1E9DC05780A5686A',
  }

  const { register, handleSubmit, setValue } = useForm({
    defaultValues
  });

  // ローカルストレージから値を取得してフォームにセットする
  useEffect(() => {
    const adminPrivateKey = localStorage.getItem('adminPrivateKey')
    const userPrivateKey = localStorage.getItem('userPrivateKey')
    //未初期化の場合は
    if (!adminPrivateKey && !userPrivateKey) {
      save(defaultValues)
    } else {
      // ローカルストレージから取得した値をフォームにセット
      setValue('adminPrivateKey', localStorage.getItem('adminPrivateKey') || '');
      setValue('userPrivateKey', localStorage.getItem('userPrivateKey') || '');
    }
    //setValue('appPrivateKey', localStorage.getItem('appPrivateKey') || '');
  }, [setValue]);

  // Save Logic
  const save = (data: any) => {
    console.log(data)
    localStorage.setItem('adminPrivateKey', data.adminPrivateKey)
    localStorage.setItem('userPrivateKey', data.userPrivateKey)
    //localStorage.setItem('appPrivateKey', data.appPrivateKey)
    setValue('adminPrivateKey', data.adminPrivateKey)
    setValue('userPrivateKey', data.userPrivateKey)
    //setValue('appPrivateKey', data.appPrivateKey)
    alert('設定をlocalStorageに保存しました')
  }

  const clear = () => {
    //reset()
    save(defaultValues)
    //localStorage.removeItem('adminPrivateKey')
    //localStorage.removeItem('userPrivateKey')
    //localStorage.removeItem('appPrivateKey')
  }

  return (
    <CommonLayout>
      <div className="page-title">
        秘密鍵設定
      </div>
      <form onSubmit={handleSubmit(save)} className="form">
        <div className="flex flex-col">
          <label>アカウントプロバイダー 秘密鍵</label>
          <input
            {...register("adminPrivateKey")}
            type="text"
            name="adminPrivateKey"
            className="w-80"
          />
        </div>
        <div className="flex flex-col">
          <label>一般ユーザー 秘密鍵</label>
          <input
            {...register("userPrivateKey")}
            type="text"
            name="userPrivateKey"
            className="w-80"
          />
        </div>
        {/*
        <div className="flex flex-col">
          <label className="w-60">ウェブアプリ 秘密鍵</label>
          <input
            {...register("appPrivateKey")}
            className="rounded-md border px-3 py-2"
            type="text"
            name="appPrivateKey"
          />
        </div>
        */}
        <div className="flex justify-between">
          <button className="btn">保存</button>
          <button className="btn-clear" onClick={clear}>リセット</button>
        </div>
      </form>
    </CommonLayout>
  )
}
export default Home

