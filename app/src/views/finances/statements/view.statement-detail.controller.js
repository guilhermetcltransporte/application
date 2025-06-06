"use server"

import { AppContext } from "@/database"
import { authOptions } from "@/libs/auth"
import { getServerSession } from "next-auth"

import _ from "lodash"

export async function getStatement({statementId}) {
    
    //const session = await getServerSession(authOptions)

    const db = new AppContext()

    const statement = await db.Statement.findOne({
        include: [
            { model: db.StatementData, as: 'statementData' }
        ],
        where: [
            {id: statementId}
        ],
        order: [[{ model: db.StatementData, as: 'statementData' }, 'entryDate', 'ASC']],
    })

    return statement.get({ plain: true })

}