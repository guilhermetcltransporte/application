"use server"

import { AppContext } from "@/database"
import { authOptions } from "@/libs/auth"
import _ from "lodash"
import { getServerSession } from "next-auth"

export async function getPayments(formData) {
    
    const session = await getServerSession(authOptions)

    const db = new AppContext()

    const payments = await db.FinancialMovementInstallment.findAll({
        include: [
            {model: db.FinancialMovement, as: 'financialMovement', include: [
                {model: db.Partner, as: 'partner', attributes: ['codigo_pessoa', 'surname']}
            ]},
            {model: db.PaymentMethod, as: 'paymentMethod'}
        ],
        where: [
            //{'$bankAccount.CodigoEmpresaFilial$': session.company.codigo_empresa_filial}
        ],
        limit: 20
    })

    return _.map(payments, (item) => item.get({ plain: true }))

}