'use server'

import { AppContext } from "@/database"
import _ from "lodash"
import { Sequelize } from "sequelize"

//export const Search = {

    export async function getUser (search) {
        //return (await new Service().Post("search/user", {search}, undefined, false))?.data

        const db = new AppContext()

        const where = []

        //where.push({'$companyUsers.company.codigo_empresa$': companyBusinessId})

        where.push({'$userName$': {[Sequelize.Op.like]: `%${search.replace(' ', "%").toUpperCase()}%`}})

        const users = await db.User.findAll({
            attributes: ['userId', 'userName'],
            include: [
                {model: db.CompanyUser, as: 'companyUsers', attributes: ['id'], include: [
                    //{model: db.Company, as: 'company', attributes: ['codigo_empresa_filial', 'companyBusinessId']}
                ]}
            ],
            where,
            order: [
                ['userName', 'asc']
            ],
            limit: 20,
        })

        return _.map(users, (user) => user.get({ plain: true }))
        
    }

//}