import Sequelize from 'sequelize';

export class Partner {

  codigo_pessoa = {
    field: 'codigo_pessoa',
    primaryKey: true,
    type: Sequelize.BIGINT
  }

  surname = {
    field: 'nome',
    primaryKey: true,
    type: Sequelize.STRING
  }

}