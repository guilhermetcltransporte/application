"use server"

import { AppContext } from "@/database"
import { authOptions } from "@/libs/auth"
import { getServerSession } from "next-auth"

export async function getCompanyUser({id}) {

    //const session = await getServerSession(authOptions)

    const db = new AppContext()

    const companyUser = await db.CompanyUser.findOne({
        include: [
            {model: db.User, as: 'user'}
        ],
        where: [{id: id}]
    })

    return companyUser?.get({ plain: true })

}

export async function setCompanyUser(formData) {

    const session = await getServerSession(authOptions)

    const db = new AppContext()

    if (!formData.companyUserId) {
        await db.CompanyUser.create({companyId: session.company.codigo_empresa_filial, userId: formData.user.userId, isActive: true})
    } else {
        await db.CompanyUser.update({companyId: session.company.codigo_empresa_filial, userId: formData.user.userId}, {where: [{id: formData.companyUserId}]})
    }

}