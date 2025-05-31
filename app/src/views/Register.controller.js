"use server"

import { AppContext } from "@/database"
import { isValidCNPJ } from "@/utils/validation"
import _ from "lodash"

export async function checkUserExists(userName) {

    const db = new AppContext()
        
    const user = await db.User.findOne({
        where: { userName },
    })

    return !!user

}

export async function getCompanyByCNPJ(cnpj) {
    
    const db = new AppContext()

    const company = await db.Company.findOne({where: [{cnpj}]})

    if (company) {
        return { exists: true, name: company.name }
    }

    return { exists: false }
    
}

export async function onRegister(formData) {

    const data = JSON.stringify(formData)
    
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }

    const response = await fetch(process.env.REGISTER_USER, config)

    if (!response.ok) {
        const error = await response.text()
        console.error('Erro no registro:', error)
        throw new Error('Erro ao registrar o usuário')
    }

    const responseJson = await response.json()

    return responseJson

}