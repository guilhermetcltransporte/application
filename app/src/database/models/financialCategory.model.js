import Sequelize from 'sequelize';

export class FinancialCategory {

  id = {
    field: 'id',
    primaryKey: true,
    autoIncrement: true,
    type: Sequelize.BIGINT
  }

  description = {
    field: 'Descricao',
    type: Sequelize.STRING
  }

}