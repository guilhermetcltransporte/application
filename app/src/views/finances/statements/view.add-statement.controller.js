"use server"

import { AppContext } from "@/database"
import { format, fromZonedTime } from "date-fns-tz"

export async function onSubmitChanges(formData) {
    
    const db = new AppContext()

    await db.transaction(async (transaction) => {

        await db.Statement.create({
            sourceId: formData.statement.sourceId,
            bankAccountId: formData.bankAccount.codigo_conta_bancaria,
            begin: format(fromZonedTime(formData.statement.begin, Intl.DateTimeFormat().resolvedOptions().timeZone),'yyyy-MM-dd HH:mm'),
            end: format(fromZonedTime(formData.statement.end, Intl.DateTimeFormat().resolvedOptions().timeZone),'yyyy-MM-dd HH:mm'),
            isActive: true
        }, {transaction})

    })

}