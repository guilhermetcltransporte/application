"use server"

import { AppContext } from "@/database";

export async function authorization({companyIntegrationId}) {

    const db = new AppContext()

    const companyIntegration = await db.CompanyIntegration.findOne({
        where: [{id: companyIntegrationId}]
    })

    let options = JSON.parse(companyIntegration.dataValues.options)

    const params = new URLSearchParams();

    params.append('grant_type', 'refresh_token')
    params.append('client_id', '1928835050355270')
    params.append('client_secret', 'HS4Bo6e3KHgQF8jpRZvGg7zXjWFv7ybi')
    params.append('refresh_token', options.refresh_token)

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    })

    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`)
    }

    const token = await response.json()

    await db.CompanyIntegration.update({options: JSON.stringify(token)}, {where: [{id: companyIntegration.dataValues.id}]})

    return token

}

export async function getStatement({companyIntegrationId}) {

    const token = await authorization({companyIntegrationId})

    const response = await fetch('https://api.mercadopago.com/v1/account/release_report/list', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.access_token}`,
        },
    })

    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    return data   

}