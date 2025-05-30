// Auth
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

// Database
import { AppContext } from '@/database'

// Components / Views
import { ViewSettings } from '@/views/settings'
import _ from 'lodash'
import { Sequelize } from 'sequelize'
import { getCompany, getUsers } from '@/views/settings/users/index.controller'

export const metadata = {
  title: `${process.env.TITLE} - Configurações`,
}

export default async function Settings() {

  const company = await getCompany()
  const users = await getUsers()

  return <ViewSettings
    company={company}
    initialUsers={users}
  />

}