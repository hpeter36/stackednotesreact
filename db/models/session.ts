import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { user, userId } from './user';

export interface sessionAttributes {
  id: string;
  expires: Date;
  session_token: string;
  user_id?: string;
}

export type sessionPk = "id";
export type sessionId = session[sessionPk];
export type sessionOptionalAttributes = "user_id";
export type sessionCreationAttributes = Optional<sessionAttributes, sessionOptionalAttributes>;

export class session extends Model<sessionAttributes, sessionCreationAttributes> implements sessionAttributes {
  id!: string;
  expires!: Date;
  session_token!: string;
  user_id?: string;

  // session belongsTo user via user_id
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof session {
    return session.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false
    },
    session_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "sessionToken"
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'session',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sessionToken",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "session_token" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
