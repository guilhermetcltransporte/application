import Sequelize from 'sequelize'

export class UserMember {

  userId = {
    field: 'UserId',
    primaryKey: true,
    type: Sequelize.UUIDV4
  }

  email = {
    field: 'Email',
    type: Sequelize.STRING
  }

}