
import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import {
  Address,
  AliasAction,
  AliasTransaction,
  Deadline,
  PublicAccount,
  NamespaceId,
  NamespaceRegistrationTransaction,
  Transaction,
	UInt64,
  IListener,
} from 'symbol-sdk';

import { aggregateTx } from '@/utils/aggregateTx';

import {
  epochAdjustment,
  networkType,
} from '@/consts/blockchainProperty';

import useSssInit from '@/hooks/useSssInit';
import useAddressInit from '@/hooks/useAddressInit';

import { useForm, SubmitHandler } from "react-hook-form";

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

import { signTx } from '@/utils/signTx';

function createRootNamespaceRegistrationTx(rootNameSpace: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const day = 60;
  const duration = UInt64.fromUint((24 * 60 * 60) / 30 * day);
  const feeMultiplier = 100; 

  // Create transaction
  return  NamespaceRegistrationTransaction.createRootNamespace(
    deadline,
    rootNameSpace,
    duration,
    networkType
  ).setMaxFee(feeMultiplier);
}

function createRootAliasTx(rootNameSpace: string, address: Address): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100; 

  // Create transaction
  return AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(rootNameSpace),
    address,
    networkType,
  ).setMaxFee(feeMultiplier);
}

function createRootRegistrationAndAliasTx(publicAccount: PublicAccount, namespaceName: string, address: Address): AliasTransaction
{
  const registrationTx = createRootNamespaceRegistrationTx(namespaceName);
  const aliasTx = createRootAliasTx(namespaceName, address);
  return aggregateTx([registrationTx, aliasTx], publicAccount);
}

async function getNameAddressList(address: Address): Promise<{ name: string, address: string }[]> {

  const resultSearch = await repo.createNamespaceRepository().search({
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

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { publicAccount, address } = useAddressInit(clientPublicKey, sssState);

  // ルートネームスペース一覧表示用
  const [nameAddressList, setNameAddressList] = useState<{name: string, address: string}[]>([]);

  let listener: IListener;

  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined) {
      (async() => {
        setNameAddressList(await getNameAddressList(address));

        if (listener === undefined) {
          listener = repo.createListener();
          await listener.open();
          listener
            .confirmed(address)
            .subscribe(async () => {
              console.log("EVENT: TRANSACTION CONFIRMED");
              setNameAddressList(await getNameAddressList(address));
            });
        }
      })();
    }
  },  [address, sssState]);

  type Inputs = {
    rootNameSpace: string;
  };

  const {
    register,
    handleSubmit,
  } = useForm<Inputs>();

  // Namespace登録
  const registerNamespace: SubmitHandler<Inputs> = (data) => {
    if (address === undefined) {
      return
    }
    signTx(createRootRegistrationAndAliasTx(publicAccount, data.rootNameSpace, address))
  }

  // NamespaceとAddressを紐づける
  const createAlias = (name: string) => {
    if (!address) {
      return;
    }
    signTx(
      createRootAliasTx(name, address)
    )
  }

  //View共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const router = useRouter();
  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />

      {address === undefined ? (
        <Backdrop open={address === undefined}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            ルートネームスペース管理
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(registerNamespace)} className="m-4 px-8 py-4 border w-full max-w-120 flex flex-col gap-4">
            <div className="flex flex-col">
              <label>
                名前
              </label>
              <input
                {...register("rootNameSpace", { required: "ネームスペースを入力してください。" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="rootNameSpace"
              />
            </div>

            <button>追加</button>
          </form>
        </Box>
      )}
      <table>
        <thead>
          <tr>
            <th>ルートネームスペース名</th>
            <th>管理</th>
            <th>割当先アドレス</th>
          </tr>
        </thead>
        <tbody>
          {nameAddressList.map((data) => (
            <tr key={data.name}>
              <td>
                { data.name }
              </td>
              <td>
                { (data.address)? (
                  <a
                  onClick={() => {
                    router.push({
                      pathname: '/admin/users',
                      query: { parentNamespace: data.name }
                    })
                  }}
                  >ユーザー管理
                  </a>
                ) : '' }
              </td>
              <td>
                { data.address? data.address : (<button onClick={() => createAlias(data.name)} className="px-4">アドレス割当</button>) }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
}
export default Home;
