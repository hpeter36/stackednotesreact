import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface verificationtokenAttributes {
  token: string;
  identifier: string;
  expires: Date;
}

export type verificationtokenPk = "token";
export type verificationtokenId = verificationtoken[verificationtokenPk];
export type verificationtokenCreationAttributes = verificationtokenAttributes;

export class verificationtoken extends Model<verificationtokenAttributes, verificationtokenCreationAttributes> implements verificationtokenAttributes {
  token!: string;
  identifier!: string;
  expires!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof verificationtoken {
    return verificationtoken.init({
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    identifier: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'verificationtoken',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
