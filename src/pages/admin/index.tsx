import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Typography, Backdrop, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import {
  Address,
  AliasTransaction,
  PublicAccount,
  IListener,
} from 'symbol-sdk';

import { aggregateTx } from '@/utils/aggregateTx';


import { useForm, SubmitHandler } from "react-hook-form";

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

import { signAndAnnounce } from '@/utils/signAndAnnounce';
import { createRootNamespaceRegistrationTx, createRootAddressAliasTx } from '@/utils/namespaceTxFactory';

import useAdminAccount from '@/hooks/useAdminAccount';

function createRootRegistrationAndAliasTx(publicAccount: PublicAccount, namespaceName: string, address: Address): AliasTransaction
{
  const registrationTx = createRootNamespaceRegistrationTx(namespaceName);
  const aliasTx = createRootAddressAliasTx(namespaceName, address);
  return aggregateTx([registrationTx, aliasTx], publicAccount);
}

async function getNameAddressList(address: Address): Promise<{ name: string, address: string }[]> {

  // 一覧取得実行
  const resultSearch = await repo.createNamespaceRepository().search({
    pageSize: 100,
    registrationType: 0, // ROOT NAMESPACE
    ownerAddress: address
  }).toPromise();
  if (!resultSearch) {
    return [];
  }
  const namespaceInfos = resultSearch.data;
  console.log('NAMESPACE[]:', namespaceInfos);

  const namespaceIds = resultSearch.data.map((ns) => ns.id);
  const names = await repo.createNamespaceRepository().getNamespacesNames(namespaceIds).toPromise();
  if (!names) {
    return [];
  }
  console.log('NAMESPACE_NAMES[]:', names);

  // id => name の連想配列を作成
  const dict: { [id: string]: string } = {};
  for (const namespaceName of names) {
    dict[namespaceName.namespaceId.toHex()] = namespaceName.name;
  }

  // { name, address } の配列を作成
  const ret: { name: string, address: string }[] = [];
  for (const info of namespaceInfos) {
    ret.push({ name: dict[info.id?.toHex()], address: info.alias.address?.pretty() as string});
  }

  return ret;
}

function Home(): JSX.Element {

  const adminAccount = useAdminAccount();

  useEffect(() => {
  }, [adminAccount]);

  // ルートネームスペース一覧表示用
  const [nameAddressList, setNameAddressList] = useState<{name: string, address: string}[]>([]);

  let listener: IListener;

  useEffect(() => {
    if (adminAccount !== undefined) {
      (async() => {
        setNameAddressList(await getNameAddressList(adminAccount.address));

        if (listener === undefined) {
          listener = repo.createListener();
          await listener.open();
          listener
            .confirmed(adminAccount.address)
            .subscribe(async () => {
              console.log("EVENT: TRANSACTION CONFIRMED");
              setNameAddressList(await getNameAddressList(adminAccount.address));
            });
        }
      })();
    }

    return () => {
      if (listener) {
        listener.close()
      }
    }
  },  [adminAccount]);

  type Inputs = {
    rootNameSpace: string;
  };

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // Namespace登録
  const registerNamespace: SubmitHandler<Inputs> = (data) => {
    if (adminAccount === undefined) {
      return
    }
    signAndAnnounce(createRootRegistrationAndAliasTx(adminAccount.publicAccount, data.rootNameSpace, adminAccount.address), adminAccount)
  }

  // NamespaceとAddressを紐づける
  const createAlias = (name: string) => {
    if (!adminAccount) {
      return;
    }
    signAndAnnounce(
      createRootAddressAliasTx(name, adminAccount.address),
      adminAccount
    )
  }

  const router = useRouter();
  return (
    <AdminLayout>

      {adminAccount === undefined ? (
        <div>アカウントが設定されていません</div>
      ) : (
        <div className="box">
          <Typography component='div' variant='h6' mt={5} mb={1}>
            ルートネームスペース管理
          </Typography>
          { adminAccount.address.plain() }
          <form onSubmit={handleSubmit(registerNamespace)} className="form">
            <div className="flex flex-col">
              <label>
                ルートネームスペース名
              </label>
              <input
                {...register("rootNameSpace", { required: "ネームスペースを入力してください。" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="rootNameSpace"
              />
            </div>

            <button className="btn">登録</button>
          </form>
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>ルートネームスペース名</th>
            <th>管理</th>
          </tr>
        </thead>
        <tbody>
          {nameAddressList.map((data) => (
            <tr key={data.name}>
              <td>
                { data.name }
              </td>
              <td>
                {
                  (data.address)? (
                    <button
                    className="btn"
                    onClick={() => {
                      router.push({
                        pathname: '/admin/users',
                        query: { parentNamespace: data.name }
                      })
                    }}
                    >ユーザー管理
                    </button>
                  ) :
                  (<button onClick={() => createAlias(data.name)} className="btn-clear">アドレス割当</button>)
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </AdminLayout>
  );
}
export default Home;
