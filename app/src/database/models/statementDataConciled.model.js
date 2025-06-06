import { DataTypes } from 'sequelize';

export class StatementDataConciled {

  id = {
    field: 'id',
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.UUIDV4,
  }

  statementDataId = {
    field: 'statementDataId',
    type: DataTypes.UUIDV4
  }

  /*
  name = {
    field: 'name',
    type: DataTypes.STRING(100)
  };

  receivementId = {
    field: 'receivementId',
    type: DataTypes.UUIDV4
  }

  paymentId = {
    field: 'paymentId',
    type: DataTypes.UUIDV4
  }
  
  paymentCategorieId = {
    field: 'paymentCategorieId',
    type: DataTypes.UUIDV4
  };

  action = {
    field: 'action',
    type: DataTypes.STRING(30)
  };

  type = {
    field: 'type',
    type: DataTypes.STRING(30)
  };

  originId = {
    field: 'originId',
    type: DataTypes.UUIDV4
  };

  destinationId = {
    field: 'destinationId',
    type: DataTypes.UUIDV4
  };

  transferId = {
    field: 'transferId',
    type: DataTypes.STRING(6)
  };
*/
  amount = {
    field: 'amount',
    type: DataTypes.DECIMAL(18, 2)
  }
  
/*
  fee = {
    field: 'fee',
    type: DataTypes.DECIMAL(18, 2)
  };

  discount = {
    field: 'discount',
    type: DataTypes.DECIMAL(18, 2)
  };

  isConciled = {
    field: 'isConciled',
    type: DataTypes.BOOLEAN
  };

  message = {
    field: 'message',
    type: DataTypes.STRING(150)
  };
  */

}