import { UInt64 } from 'symbol-sdk'
import {
  epochAdjustment,
} from '@/consts/blockchainProperty'

// SymbolのタイムスタンプからUnixタイムスタンプへの変換関数
function timestampToUnixTime(symbolTimestamp: UInt64) {
    // UInt64から数値への変換
    const ts = symbolTimestamp.compact()
    // NEMesisブロックからの経過時間（秒）を加算
    return (epochAdjustment * 1000 + ts) / 1000
}

export default timestampToUnixTime
