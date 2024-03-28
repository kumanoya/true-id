import { format } from "date-fns"

export const formatTimestamp = (unixTime: number): string|null => {

  console.log(unixTime)
  console.log(typeof unixTime)
  // Dateオブジェクトを生成
  const date = new Date(unixTime)

  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm")
}


