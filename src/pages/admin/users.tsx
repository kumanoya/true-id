"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Typography } from '@mui/material';
import {
  NamespaceId,
  IListener,
} from 'symbol-sdk';

import { useForm } from "react-hook-form";

import { createRepositoryFactory } from '@/utils/createRepositoryFactory';
const repo = createRepositoryFactory();

import { useSearchParams } from 'next/navigation';
import useAdminAccount from '@/hooks/useAdminAccount';

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


function Users(): JSX.Element {

  const searchParams = useSearchParams();
  const parentNamespace = searchParams.get('parentNamespace') as string;

  const adminAccount = useAdminAccount()

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

  let listener: IListener;

  // トランザクションのCONFIRMEDを監視
  useEffect(() => {
    if (adminAccount !== undefined && parentNamespace) {
      (async() => {
        updateNameAddressList();

        if (listener === undefined) {
          listener = repo.createListener();
          await listener.open();
          listener
            .confirmed(adminAccount.address)
            .subscribe(async (block) => {
              console.log("EVENT: TRANSACTION CONFIRMED:", block);
              updateNameAddressList();
            });
          }
      })();
    }
  },  [adminAccount, parentNamespace]);

  type Inputs = {
    namespaceName: string;
    addresses: { [name: string]: string };
  };

  const {
    setValue,
  } = useForm<Inputs>();

  /*
  const {
    fields,
  } = useFieldForm({ name: 'addresses', defaultValue: {} });
  */


  return (
    <AdminLayout>
      <Typography component='div' variant='h6' mt={5} mb={1}>
        ユーザーID管理@{ parentNamespace }
      </Typography>

      <table className="mx-8 table" >
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
                { data.address }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </AdminLayout>
  );
}
export default Users;
