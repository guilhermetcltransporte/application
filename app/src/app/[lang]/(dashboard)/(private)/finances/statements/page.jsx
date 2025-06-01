import UserList from '@views/apps/user/list'

import { getUserData } from '@/app/server/actions'
import { ViewFinancesStatements } from '@/views/finances/statements/list'

const FinancesStatements = async () => {

  const data = await getUserData()

  return <ViewFinancesStatements userData={data} />

}

export default FinancesStatements
