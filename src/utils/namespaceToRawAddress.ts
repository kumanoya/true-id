import {
  NamespaceId,
} from 'symbol-sdk'
import { createRepositoryFactory } from '@/utils/createRepositoryFactory'

//==============================================================================
// namespaceToRawAddress
//==============================================================================
const namespaceToRawAddress = async (namespaceName: string): Promise<string|null> => {

  const repo = createRepositoryFactory()
  const namespaceRepo = repo.createNamespaceRepository()
  const namespaceId = new NamespaceId(namespaceName)


  // ネームスペースの情報取得
  const namespaceInfo = await namespaceRepo.getNamespace(namespaceId).toPromise()
    .catch((error) => { throw new Error(`namespaceToRawAddress: ${error}`) })

  console.log('namespaceId:', namespaceId)
  console.log('namespaceInfo:', namespaceInfo)

  // ネームスペースのエイリアス情報を取得し、紐づけられているアドレスを表示
  if (namespaceInfo?.alias?.type === 2 && namespaceInfo.alias.address) { // エイリアスのタイプがアドレスである場合
    return namespaceInfo.alias.address.plain()
  }
  return null
}

export default namespaceToRawAddress




