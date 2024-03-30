import { format } from "date-fns"

export const formatId = (subNamespaceName: string|null|undefined): string => {
  if (subNamespaceName === null || subNamespaceName === undefined) {
    return ''
  }
  // .split('.')で文字列を分割し、逆順にしてから@で結合
  return subNamespaceName.split('.').reverse().join('@')
}


export const unformatId = (id: string|null|undefined): string => {
  if (id === null || id === undefined) {
    return ''
  }
  // .split('@')で文字列を分割し、逆順にしてから.で結合
  return id.split('@').reverse().join('.')
}




