import Sequelize from 'sequelize';

export class FinancialMovement {

    codigo_movimento = {
        field: 'codigo_movimento',
        primaryKey: true,
        type: Sequelize.INTEGER
    }

    bankAccountId = {
        field: 'codigo_conta',
        type: Sequelize.BIGINT
    }
  
}