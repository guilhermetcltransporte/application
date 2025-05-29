// Next Imports
import dynamic from 'next/dynamic'
import { getServerSession } from "next-auth"

// Component Imports
import AccountSettings from '@views/pages/account-settings'
import { authOptions } from '@/libs/auth'

const Company = dynamic(() => import('@views/settings/company'))
const SecurityTab = dynamic(() => import('@views/pages/account-settings/security'))
const Signature = dynamic(() => import('@views/settings/signature'))
const NotificationsTab = dynamic(() => import('@views/pages/account-settings/notifications'))
const ConnectionsTab = dynamic(() => import('@views/pages/account-settings/connections'))

// Vars
const tabContentList = () => ({
  account: <Company />,
  security: <SecurityTab />,
  'billing-plans': <Signature />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const AccountSettingsPage = async () => {

  const session = await getServerSession(authOptions)

  console.log(session)

  return <AccountSettings tabContentList={tabContentList()} />

}

export default AccountSettingsPage
