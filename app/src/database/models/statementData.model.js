import { DataTypes } from 'sequelize';

export class StatementData {

  id = {
    field: 'id',
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.UUID,
  };

  statementId = {
    field: 'statementId',
    type: DataTypes.UUID
  };

  date = {
    field: 'date',
    type: DataTypes.DATE
  };

  description = {
    field: 'description',
    type: DataTypes.STRING(50),
  };

  sourceId = {
    field: 'sourceId',
    type: DataTypes.STRING,
  };

  orderId = {
    field: 'orderId',
    type: DataTypes.STRING,
  };
  
  gross = {
    field: 'gross',
    type: DataTypes.DECIMAL(18, 2)
  };

  coupon = {
    field: 'coupon',
    type: DataTypes.DECIMAL(18, 2)
  };

  fee = {
    field: 'fee',
    type: DataTypes.DECIMAL(18, 2)
  };

  shipping = {
    field: 'shipping',
    type: DataTypes.DECIMAL(18, 2)
  };

  shippingCost = {
    field: 'shippingCost',
    type: DataTypes.DECIMAL(18, 2)
  };

  debit = {
    field: 'debit',
    type: DataTypes.DECIMAL(18, 2)
  };

  credit = {
    field: 'credit',
    type: DataTypes.DECIMAL(18, 2)
  };

  balance = {
    field: 'balance',
    type: DataTypes.DECIMAL(18, 2)
  };

  data = {
    field: 'data',
    type: DataTypes.JSONB
  };

}