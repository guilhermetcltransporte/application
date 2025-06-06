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
            { model: db.StatementData, as: 'statementData', include: [
                { model: db.StatementDataConciled, as: 'concileds' }
            ]}
        ],
        where: [
            {id: statementId}
        ],
        order: [[{ model: db.StatementData, as: 'statementData' }, 'entryDate', 'ASC']],
    })

    return statement.get({ plain: true })

}

export async function saveStatementConciled(statementDataId, values) {
  const db = new AppContext();

  const payload = {
    statementDataId,
    type: values.type,
    description: values.description || '',
    amount: Number(values.amount) || 0,
    fee: Number(values.fee) || 0,
    discount: Number(values.discount) || 0,
    partnerId: values.partner?.id || null,
  };

  if (values.id) {
    // Edição
    await db.StatementDataConciled.update(payload, { where: { id: values.id } });
    return { ...payload, id: values.id };
  } else {
    // Criação
    const result = await db.StatementDataConciled.create(payload);
    return result.toJSON();
  }
}
