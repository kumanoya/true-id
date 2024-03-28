import { format } from "date-fns"

export const formatUnixTime = (unixTime: number|null|undefined): string|null => {

  if (unixTime === null || unixTime === undefined) {
    return null
  }
  // Dateオブジェクトを生成
  const date = new Date(unixTime * 1000) //msで指定するために1000倍
  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm")
}


