
// Auth
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

// Database
import { AppContext } from '@/database'

// Components / Views
import { ViewSettings } from '@/views/settings'

export const metadata = {
  title: `${process.env.TITLE} - Configurações`,
}

export default async function Settings() {

  const session = await getServerSession(authOptions)

  const db = new AppContext()

  const company = await db.Company.findOne({
    attributes: ['codigo_empresa_filial', 'cnpj', 'name', 'surname'],
    where: [{codigo_empresa_filial: session.company.codigo_empresa_filial}]
  })

  let users = await db.CompanyUser.findAll({
    where: {
      companyId: session.company.codigo_empresa_filial,
    },
    include: [{
      model: db.User,
      as: 'user',
      attributes: ['userId', 'userName'],
      include: [
        {model: db.UserMember, as: 'userMember', attributes: ['email']}
      ]
    }],
  })

  users = users.map(record => {
    const user = record.user?.dataValues || {}
    user.userMember = user.userMember?.dataValues || null
    return user
  })

  return <ViewSettings company={company.dataValues} users={users} />

}