import { proxy } from 'valtio'
import { useProxy } from 'valtio/utils'

const store = proxy({ open: false })
export const useStore = () => useProxy(store)
