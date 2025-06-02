import Sequelize from 'sequelize';

export class Partner {

  codigo_pessoa = {
    field: 'codigo_pessoa',
    primaryKey: true,
    type: Sequelize.BIGINT
  }

  surname = {
    field: 'RazaoSocial',
    primaryKey: true,
    type: Sequelize.STRING
  }

}