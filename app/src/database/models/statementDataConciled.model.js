import { DataTypes } from 'sequelize';

export class StatementDataConciled {

  id = {
    field: 'id',
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.UUID,
  };
  
  name = {
    field: 'name',
    type: DataTypes.STRING(100)
  };

  statementDataId = {
    field: 'statementDataId',
    type: DataTypes.UUID
  };
  
  receivementId = {
    field: 'receivementId',
    type: DataTypes.UUID
  }

  paymentId = {
    field: 'paymentId',
    type: DataTypes.UUID
  }
  
  paymentCategorieId = {
    field: 'paymentCategorieId',
    type: DataTypes.UUID
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
    type: DataTypes.UUID
  };

  destinationId = {
    field: 'destinationId',
    type: DataTypes.UUID
  };

  transferId = {
    field: 'transferId',
    type: DataTypes.STRING(6)
  };

  amount = {
    field: 'amount',
    type: DataTypes.DECIMAL(18, 2)
  };

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

}