'use server'

import { AppContext } from "@/database"
import { authOptions } from "@/libs/auth"
import _ from "lodash"
import { getServerSession } from "next-auth"
import { Sequelize } from "sequelize"

export async function getUser (search) {
    
    const session = await getServerSession(authOptions)

    const db = new AppContext()

    const where = []

    console.log(session.company)

    where.push({'$companyUsers.company.codigo_empresa$': session.company.companyBusiness.codigo_empresa})

    where.push({'$userName$': {[Sequelize.Op.like]: `%${search.replace(' ', "%").toUpperCase()}%`}})

    const users = await db.User.findAll({
        attributes: ['userId', 'userName'],
        include: [
            {
            model: db.CompanyUser,
            as: 'companyUsers',
            required: true,
            attributes: ['id'],
            include: [
                {
                model: db.Company,
                as: 'company',
                required: true,
                attributes: ['codigo_empresa', 'companyBusinessId'],
                where: {
                    codigo_empresa: session.company.codigo_empresa_filial
                }
                }
            ]
            }
        ],
        where: {
            userName: {
            [Sequelize.Op.like]: `%${search.replace(/ /g, "%").toUpperCase()}%`
            }
        },
        order: [['userName', 'asc']],
        limit: 20,
        offset: 0,
        subQuery: false
    })

    return _.map(users, (user) => user.get({ plain: true }))
    
}


export async function getBankAccounts (search) {
    
    const session = await getServerSession(authOptions)

    const db = new AppContext()

    const where = []

    //where.push({'$companyUsers.company.codigo_empresa$': session.company.companyBusinessId})

    //where.push({'$userName$': {[Sequelize.Op.like]: `%${search.replace(' ', "%").toUpperCase()}%`}})

    const bankAccounts = await db.BankAccount.findAll({
        attributes: ['codigo_conta_bancaria', 'agency', 'number'],
        include: [
            {model: db.Bank, as: 'bank'},
            {model: db.CompanyIntegration, as: 'companyIntegration'}
        ],
        where: {
            agencia: {
                [Sequelize.Op.like]: `%${search.replace(/ /g, "%").toUpperCase()}%`
            }
        },
        order: [['agency', 'asc']],
        limit: 20,
        offset: 0,
        subQuery: false
    })

    return _.map(bankAccounts, (user) => user.get({ plain: true }))
    
}