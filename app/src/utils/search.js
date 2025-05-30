'use server'

import { AppContext } from "@/database"
import { authOptions } from "@/libs/auth"
import _ from "lodash"
import { getServerSession } from "next-auth"
import { Sequelize } from "sequelize"

//export const Search = {

    export async function getUser (search) {
        
        const session = await getServerSession(authOptions)

        const db = new AppContext()

        const where = []

        where.push({'$companyUsers.company.codigo_empresa$': session.company.companyBusinessId})

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
                        codigo_empresa: session.company.companyBusinessId
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

//}