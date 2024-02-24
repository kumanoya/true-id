"use client";

import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import {
  Address,
  AliasAction,
  AliasTransaction,
  Deadline,
  NamespaceId,
  NamespaceRegistrationTransaction,
  Transaction,
} from 'symbol-sdk';

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

import { useSearchParams } from 'next/navigation';

async function getNameAddressList(parentNamespace: string): Promise<{ name: string, address: string }[]> {

  const resultSearch = await repo.createNamespaceRepository().search({
    registrationType: 1, // SUB NAMESPACE
    level0: new NamespaceId(parentNamespace), // parentNamespace
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
    ret.push({ name: dict[info.id?.toHex()], address: info.alias.address?.plain() as string});
  }

  return ret;
}

function createRegistrationTx(parentNamespace: string, namespaceName: string): Transaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  console.log('parentNamespace:', parentNamespace);
  console.log('namespaceName:', namespaceName);
  // Create transaction
  const tx = NamespaceRegistrationTransaction.createSubNamespace(
    deadline,
    namespaceName,
    parentNamespace,
    networkType
  ).setMaxFee(feeMultiplier);

  return tx;
}

function createAliasTx(parentNamespace: string, namespaceName: string, address: string): AliasTransaction
{
  // Transaction info
  const deadline = Deadline.create(epochAdjustment); // デフォルトは2時間後
  const feeMultiplier = 100;
  // Create transaction
  const aliasTransaction = AliasTransaction.createForAddress(
    deadline,
    AliasAction.Link,
    new NamespaceId(parentNamespace + '.' + namespaceName),
    Address.createFromRawAddress(address),
    networkType,
  ).setMaxFee(feeMultiplier);

  return aliasTransaction;
}


function Home(): JSX.Element {

  const searchParams = useSearchParams();
  const parentNamespace = searchParams.get('parentNamespace') as string;

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();

  // アドレス取得
  const { address } = useAddressInit(clientPublicKey, sssState);

  // ユーザーID（サブネームスペース）一覧表示用
  const [nameAddressList, setNameAddressList] = useState<{name: string, address: string}[]>([]);

  async function updateNameAddressList() {
    const list = await getNameAddressList(parentNamespace)
    setNameAddressList(list);

    // {name, address}[]から{ name: address }の連想配列を作成
    const addresses: {[name: string]: string} = {}
    for (const data of list) {
      addresses[data.name] = data.address;
    }
    setValue('addresses', addresses);
  }

  // トランザクションのCONFIRMEDを監視
  useEffect(() => {
    if (sssState === 'ACTIVE' && address !== undefined && parentNamespace) {
      (async() => {
        updateNameAddressList();

        const listener = repo.createListener();
        await listener.open();
        listener
          .confirmed(address)
          .subscribe(async () => {
            console.log("EVENT: TRANSACTION CONFIRMED");
            updateNameAddressList();
          });
      })();
    }
  },  [address, sssState, parentNamespace]);

  type Inputs = {
    namespaceName: string;
    addresses: { [name: string]: string };
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
  } = useForm<Inputs>();

  /*
  const {
    fields,
  } = useFieldForm({ name: 'addresses', defaultValue: {} });
  */


  // Namespace登録
  const registerNamespace: SubmitHandler<Inputs> = (data) => {
    (async () => {
      await signTx(
        createRegistrationTx(parentNamespace, data.namespaceName)
      )
    })()
  }

  // NamespaceとAddressを紐づける
  const createAlias = (name: string) => {
    const values = getValues();
    const address = values['addresses'][name];
    signTx(
      createAliasTx(parentNamespace, name, address)
    )
  }

  // View共通設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
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
            ユーザーID管理@{ parentNamespace }
          </Typography>
          { address.plain() }
          <form onSubmit={handleSubmit(registerNamespace)} className="m-4 px-8 py-4 border w-full max-w-96 flex flex-col gap-4">
            <div className="flex flex-col">
              <label> ID </label>
              <input
                {...register("namespaceName", { required: "ID(サブネームスペース）を入力してください。" })}
                className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                type="text"
                name="namespaceName"
              />
            </div>

            <button>追加</button>
          </form>
        </Box>
      )}

      <table className="mx-8" >
        <thead>
          <tr>
            <th>ユーザーID</th>
            <th>割当先</th>
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
                  data.address? data.address :(
                    <>
                      <input
                        key={'address-' + data.name}
                        {...register(`addresses.${data.name}`)}
                        className="rounded-md border px-3 py-2 focus:border-2 focus:border-teal-500 focus:outline-none"
                      />
                      <button
                        onClick={() => createAlias(data.name)}
                        className="border px-3 py-2 mx-2"
                      >アドレス割当</button>
                    </>
                  )
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
}
export default Home;
