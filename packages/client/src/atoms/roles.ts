import { atomWithStorage } from 'jotai/utils'
import type { SockbaseRole } from 'sockbase'

const roles = atomWithStorage<Record<string, SockbaseRole> | null | undefined>('roles', undefined)

export default roles
