import { format } from "date-fns"

export const formatTimestamp = (timestamp: { lower: number; higher: number }): string => {
  // UNIXタイムスタンプをミリ秒単位で計算
  const unixTimestamp = (timestamp.higher * 4294967296 + timestamp.lower) / 1000

  // Dateオブジェクトを生成
  const date = new Date(unixTimestamp * 1000)

  // date-fnsを使ってフォーマット
  return format(date, "yyyy-MM-dd HH:mm")
}


