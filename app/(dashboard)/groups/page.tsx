import { auth } from '@/auth'
import { GroupsClient } from '@/components/groups/groups-client'

export default async function GroupsPage() {
  const session = await auth()
  return <GroupsClient user={session!.user!} />
}
