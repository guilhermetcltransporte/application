import Sequelize from 'sequelize'

export class User {

  userId = {
    field: 'UserId',
    primaryKey: true,
    type: Sequelize.UUIDV4
  }

  userName = {
    field: 'UserName',
    type: Sequelize.STRING
  }

}