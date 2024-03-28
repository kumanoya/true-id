import { UInt64 } from 'symbol-sdk'

// SymbolのNEMesisブロックのUnixタイムスタンプ
const nemesisTimestamp = new Date('2015-03-29T00:06:25Z').getTime() / 1000

// SymbolのタイムスタンプからUnixタイムスタンプへの変換関数
function timestampToUnixTime(symbolTimestamp: UInt64) {
    // UInt64から数値への変換
    const timestampNumeric = symbolTimestamp.compact()

    // NEMesisブロックからの経過時間（秒）を加算
    return nemesisTimestamp + timestampNumeric
}

export default timestampToUnixTime
