// Next Imports
import dynamic from 'next/dynamic'
import { getServerSession } from "next-auth"

// Component Imports
import AccountSettings from '@views/pages/account-settings'
import { authOptions } from '@/libs/auth'

const AccountTab = dynamic(() => import('@views/pages/account-settings/account'))
const SecurityTab = dynamic(() => import('@views/pages/account-settings/security'))
const BillingPlansTab = dynamic(() => import('@views/pages/account-settings/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/pages/account-settings/notifications'))
const ConnectionsTab = dynamic(() => import('@views/pages/account-settings/connections'))

// Vars
const tabContentList = () => ({
  account: <AccountTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlansTab />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const AccountSettingsPage = async () => {

  const session = await getServerSession(authOptions)

  console.log(session)

  return <AccountSettings tabContentList={tabContentList()} />

}

export default AccountSettingsPage
