import { format } from "date-fns"

export const formatTimestamp = (unixTime: number|null|undefined): string|null => {

  if (unixTime === null || unixTime === undefined) {
    return null
  }

  console.log(unixTime)
  console.log(typeof unixTime)
  // Dateオブジェクトを生成
  const date = new Date(unixTime)

  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm")
}


