// Next Imports

import { getServerSession } from "next-auth"

// Component Imports
import { ViewSettings } from '@/views/settings'
import { authOptions } from '@/libs/auth'
import { AppContext } from '@/database'

const Settings = async () => {

  const session = await getServerSession(authOptions)

  const db = new AppContext()

  const company = await db.Company.findOne({attributes: ['codigo_empresa_filial', 'cnpj', 'name', 'surname'], where: [{codigo_empresa_filial: session.company.codigo_empresa_filial}]})

  return <ViewSettings company={company.dataValues} />

}

export default Settings
