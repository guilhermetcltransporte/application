import Sequelize from 'sequelize';

export class BankAccount {

  codigo_conta_bancaria = {
    field: 'codigo_conta_bancaria',
    primaryKey: true,
    autoIncrement: true,
    type: Sequelize.INTEGER
  }

  agency = {
    field: 'agencia',
    type: Sequelize.STRING
  }

}