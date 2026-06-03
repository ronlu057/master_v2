// per-Header lazy ensureState 已在 useNavtoolConfig 內自動處理
// （每個 Header mount 呼叫 useNavtoolConfig 時，state 第一次建立會自動讀對應 localStorage）
// 這個 plugin 留作 future-proof 鉤子，目前 noop
export default defineNuxtPlugin(() => {})
