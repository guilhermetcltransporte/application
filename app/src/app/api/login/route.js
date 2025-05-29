// Next Imports
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Mock data for demo purpose
import { users } from './users'

export async function POST(req) {

  // Vars
  const { email, password } = await req.json()

  const db = new PrismaClient()

  const user2 = await db.user.findFirst({select: {email: true}, where: {email}})

  console.log(user2)

  const user = users.find(u => u.email === email && u.password === password)
  let response = null

  if (user) {
    const { password: _, ...filteredUserData } = user

    response = {
      ...filteredUserData
    }

    const session = {
      ...filteredUserData,
      companyId: 1  // <- Garantido explicitamente (opcional)
    }

    console.log(session)

    return NextResponse.json(session)

  } else {
    // We return 401 status code and error message if user is not found
    return NextResponse.json(
      {
        // We create object here to separate each error message for each field in case of multiple errors
        message: ['Email or Password is invalid']
      },
      {
        status: 401,
        statusText: 'Unauthorized Access'
      }
    )
  }
}
