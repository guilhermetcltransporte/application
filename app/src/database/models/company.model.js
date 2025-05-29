import Sequelize from 'sequelize';

export class Company {

  codigo_empresa_filial = {
    field: 'codigo_empresa_filial',
    primaryKey: true,
    autoIncrement: true,
    type: Sequelize.NUMBER
  }

  cnpj = {
    field: 'cnpj',
    type: Sequelize.STRING(14)
  }

  name = {
    field: 'descricao',
    type: Sequelize.STRING
  }

  surname = {
    field: 'nome_fantasia',
    type: Sequelize.STRING
  }

  companyBusinessId = {
    field: 'codigo_empresa',
    type: Sequelize.NUMBER
  }

}