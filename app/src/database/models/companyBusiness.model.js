import Sequelize from 'sequelize';

export class CompanyBusiness {

  id = {
    field: 'codigo_empresa',
    primaryKey: true,
    autoIcrement: true,
    type: Sequelize.NUMBER
  }

  description = {
    field: 'descricao',
    type: Sequelize.STRING
  }

}