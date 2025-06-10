"use server"

import { ViewFinancesPayments } from '@/views/finances/payments'
import { getStatements } from '@/views/finances/statements/index.controller'

const FinancesStatements = async () => {

  const initialStatements = await getStatements()

  return <ViewFinancesPayments initialStatements={initialStatements} />

}

export default FinancesStatements
