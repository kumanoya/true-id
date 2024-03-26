import { Account } from 'symbol-sdk'

interface UserInfo {
  userIds: string[],
  currentUserId: string|null,
  account: Account|null|undefined,
  setCurrentUserId: (userId: string) => void,
}

export default UserInfo
