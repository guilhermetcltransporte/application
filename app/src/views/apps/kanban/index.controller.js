"use server"

import { AppContext } from "@/database"
import _ from "lodash"
import { Op } from "sequelize"

export async function getBankAccounts() {
    const db = new AppContext()

    const bankAccounts = await db.BankAccount.findAll({
        include: [
            {model: db.Bank, as: 'bank'}
        ],
        where: [{ isAtivo: true }]
    })
        
    const financialMovementInstallments = await db.FinancialMovementInstallment.findAll({
        include: [
            {model: db.FinancialMovement, as: 'financialMovement', include: [
                {model: db.Partner, as: 'partner'},
            ]}
        ],
        where: [{
            codigo_pagamento: {
                [Op.is]: null
            },
            //data_vencimento: {
            //    [Op.gte]: '2025-06-01T00:00:00'
            //}
        }],
        order: [['data_vencimento', 'ASC']]
    })

    const wFinancialMovementInstallments = _.map(financialMovementInstallments, item => ({
        ...item.get({ plain: true }),
        id: item.codigo_movimento_detalhe,
    }))

    const wBankAccounts = _.map(bankAccounts, item => ({
        ...item.get({ plain: true }),
        id: item.codigo_conta_bancaria,
        title: item.bank.description,
        taskIds: _.filter(wFinancialMovementInstallments, (item) => item.financialMovement.bankAccountId === item.codigo_conta_bancaria).map(item => item.id).slice(0, 10)
    }))

    // Adiciona o item com id null no início
    return {
        bankAccounts: [
            {
                id: null,
                title: '[Nenhum]',
                //taskIds: wFinancialMovementInstallments.map(item => item.id)
                taskIds: _.filter(wFinancialMovementInstallments, (item) => item.financialMovement.bankAccountId === null).map(item => item.id).slice(0, 10)
            },
            ...wBankAccounts
        ],
        financialInstallments: wFinancialMovementInstallments
    }
}
