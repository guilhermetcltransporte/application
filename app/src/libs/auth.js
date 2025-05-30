import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { AppContext } from '@/database'
import _ from 'lodash'
import { Sequelize } from 'sequelize'

export const authOptions = {
  //adapter: PrismaAdapter(AppContext),
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {

        const { email, password, companyBusinessId, companyId } = credentials

        try {

          const db = new AppContext()

          const user = await db.User.findOne({
            attributes: ['userId', 'userName'],
            include: [
              {model: db.UserMember, as: 'userMember', attributes: ['userId', 'email', 'password']},
            ],
            where: Sequelize.literal(`"user"."userName" = :email OR "userMember"."email" = :email`),
            replacements: { email },
            //transaction
          })

          if (_.isEmpty(user)) {
            throw new Error(JSON.stringify({ status: 201, message: 'Usuário não encontrado!' }))
          }

          const data = JSON.stringify({ username: email, password: password })
          
          const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
          }

          const response = await fetch(process.env.VALIDATE_USER, config)

          const res = await response.json()

          if (!res.d) {
            throw new Error(JSON.stringify({ status: 202, message: 'Senha incorreta!' }))
          }

          const whereCompanyBusiness = {}

          if (companyBusinessId) {
            whereCompanyBusiness.codigo_empresa = Number(companyBusinessId)
          }

          const whereCompany = {}
          if (companyId) {
            whereCompany.codigo_empresa_filial = Number(companyId)
          }

          const companyBusinesses = await db.CompanyBusiness.findAll({
            where: {
              ...whereCompanyBusiness,
              ...(user?.userId && {
                '$companies.companyUsers.userId$': user.userId
              }),
            },
            include: [
              {
                model: db.Company,
                as: 'companies',
                where: {
                  ...whereCompany,
                },
                required: true,
                include: [
                  {
                    model: db.CompanyUser,
                    as: 'companyUsers',
                    required: true,
                  },
                ],
                attributes: ['codigo_empresa_filial', 'name', 'surname', 'companyBusinessId'],
              },
            ],
            order: [['companies', 'codigo_empresa_filial', 'ASC']],
          })


          if (_.size(companyBusinesses) == 0) {
            throw new Error(JSON.stringify({ status: 211, message: 'Nenhuma empresa encontrada!' }))
          }

          if (_.size(companyBusinesses) > 1) {
            throw new Error(JSON.stringify({ status: 212, companyBusinessId, companyBusiness: companyBusinesses }))
          }

          if (_.size(companyBusinesses[0]?.companies) == 0) {
            throw new Error(JSON.stringify({ status: 211, message: 'Nenhuma filial encontrada!' }))
          }

          if (_.size(companyBusinesses[0]?.companies) > 1) {
            throw new Error(JSON.stringify({ status: 213, companyBusinessId: companyBusinesses[0].id, companyBusiness: companyBusinesses, companies: companyBusinesses[0]?.companies }))
          }

          return {
            user: user,
            company: companyBusinesses[0]?.companies[0]
          }

        } catch (error) {
          throw new Error(error.message)
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60 // ** 1 days
    //maxAge: 60, // ** 60 seconds
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.user = user.user
        token.company = user.company
      }

      return token

    },
    async session({ session, token }) {

      session.user = token.user
      session.company = token.company

      return session
    }
  }
}