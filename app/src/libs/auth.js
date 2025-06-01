import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { AppContext } from '@/database'
import _ from 'lodash'
import { Sequelize } from 'sequelize'

async function validateUserByEmail({ email, password, companyBusinessId, companyId, validatePassword = true }) {
  
  const db = new AppContext()

  const user = await db.User.findOne({
    attributes: ['userId', 'userName'],
    include: [
      {
        model: db.UserMember,
        as: 'userMember',
        attributes: ['userId', 'email', 'password'],
      },
    ],
    where: Sequelize.literal(`"user"."userName" = :email OR "userMember"."email" = :email`),
    replacements: { email },
  })

  if (_.isEmpty(user)) {
    throw new Error(JSON.stringify({ status: 201, message: 'Usuário não encontrado!' }))
  }

  if (validatePassword) {
    const response = await fetch(process.env.VALIDATE_USER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.userName, password }),
    })

    const res = await response.json()

    if (!res.d) {
      throw new Error(JSON.stringify({ status: 202, message: 'Senha incorreta!' }))
    }
  }

  const whereCompanyBusiness = companyBusinessId ? { codigo_empresa: Number(companyBusinessId) } : {}
  const whereCompany = companyId ? { codigo_empresa_filial: Number(companyId) } : {}

  const companyBusinesses = await db.CompanyBusiness.findAll({
    where: {
      ...whereCompanyBusiness,
      ...(user?.userId && { '$companies.companyUsers.userId$': user.userId }),
    },
    include: [
      {
        model: db.Company,
        as: 'companies',
        where: { ...whereCompany },
        required: true,
        include: [{ model: db.CompanyUser, as: 'companyUsers', required: true }],
        attributes: ['codigo_empresa_filial', 'name', 'surname'],
      },
    ],
    order: [['companies', 'codigo_empresa_filial', 'ASC']],
  })

  if (_.isEmpty(companyBusinesses)) throw new Error(JSON.stringify({ status: 211, message: 'Nenhuma empresa encontrada!' }))
  if (_.size(companyBusinesses) > 1)
    throw new Error(JSON.stringify({ status: 212, companyBusinessId, companyBusiness: companyBusinesses }))

  const selectedCompany = companyBusinesses[0]?.companies?.[0]

  if (!selectedCompany) throw new Error(JSON.stringify({ status: 211, message: 'Nenhuma filial encontrada!' }))
  if (_.size(companyBusinesses[0]?.companies) > 1)
    throw new Error(JSON.stringify({ status: 213, companyBusinessId: companyBusinesses[0].codigo_empresa, companyBusiness: companyBusinesses, companies: companyBusinesses[0]?.companies }))

  const companyUser = selectedCompany?.companyUsers?.[0]

  if (_.isNil(companyUser?.isActive)) throw new Error(JSON.stringify({ status: 214, message: 'Usuário pendente de aprovação!' }))
  if (companyUser.isActive === false) throw new Error(JSON.stringify({ status: 215, message: 'Usuário desativado!' }))

  let company = _.cloneDeep(selectedCompany.dataValues)
  company.companyBusiness = companyBusinesses[0].dataValues

  return { user, company, isActive: companyUser.isActive }

}

export const authOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password, companyBusinessId, companyId } = credentials
        return await validateUserByEmail({ email, password, companyBusinessId, companyId })
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60, // 1 dia
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {

      const db = new AppContext()

      // Google login
      if (account?.provider === 'google' && user?.email) {
        try {
          const result = await validateUserByEmail({ email: user.email, validatePassword: false })
          token.user = result.user
          token.company = result.company
          token.isActive = result.isActive
          return token
        } catch (err) {

          const parsedError = (() => {
            try {
              return JSON.parse(err.message)
            } catch {
              return { status: 500, message: 'Erro ao validar login com Google.' }
            }
          })()

          throw new Error(JSON.stringify(parsedError))

        }
      }

      if (user) {
        token.user = user.user
        token.company = user.company
      }

      if (token.user?.userId) {

        const companyUser = await db.CompanyUser.findOne({
          where: {
            userId: token.user.userId,
          },
          attributes: ['isActive']
        })

        token.isActive = companyUser?.isActive

      }

      return token

    },
    async session({ session, token }) {
      session.user = token.user
      session.company = token.company
      session.isActive = token.isActive ?? false
      return session
    },
  },
}