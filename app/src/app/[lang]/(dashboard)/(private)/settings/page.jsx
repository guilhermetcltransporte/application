
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

  return <ViewSettings company={company.dataValues} />

}