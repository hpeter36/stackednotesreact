import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { account, accountId } from './account';
import type { notes, notesId } from './notes';
import type { session, sessionId } from './session';

export interface userAttributes {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type userPk = "id";
export type userId = user[userPk];
export type userOptionalAttributes = "name" | "email" | "emailVerified" | "image" | "createdAt" | "updatedAt";
export type userCreationAttributes = Optional<userAttributes, userOptionalAttributes>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
  id!: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // user hasMany account via user_id
  accounts!: account[];
  getAccounts!: Sequelize.HasManyGetAssociationsMixin<account>;
  setAccounts!: Sequelize.HasManySetAssociationsMixin<account, accountId>;
  addAccount!: Sequelize.HasManyAddAssociationMixin<account, accountId>;
  addAccounts!: Sequelize.HasManyAddAssociationsMixin<account, accountId>;
  createAccount!: Sequelize.HasManyCreateAssociationMixin<account>;
  removeAccount!: Sequelize.HasManyRemoveAssociationMixin<account, accountId>;
  removeAccounts!: Sequelize.HasManyRemoveAssociationsMixin<account, accountId>;
  hasAccount!: Sequelize.HasManyHasAssociationMixin<account, accountId>;
  hasAccounts!: Sequelize.HasManyHasAssociationsMixin<account, accountId>;
  countAccounts!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany notes via user_id
  notes!: notes[];
  getNotes!: Sequelize.HasManyGetAssociationsMixin<notes>;
  setNotes!: Sequelize.HasManySetAssociationsMixin<notes, notesId>;
  addNote!: Sequelize.HasManyAddAssociationMixin<notes, notesId>;
  addNotes!: Sequelize.HasManyAddAssociationsMixin<notes, notesId>;
  createNote!: Sequelize.HasManyCreateAssociationMixin<notes>;
  removeNote!: Sequelize.HasManyRemoveAssociationMixin<notes, notesId>;
  removeNotes!: Sequelize.HasManyRemoveAssociationsMixin<notes, notesId>;
  hasNote!: Sequelize.HasManyHasAssociationMixin<notes, notesId>;
  hasNotes!: Sequelize.HasManyHasAssociationsMixin<notes, notesId>;
  countNotes!: Sequelize.HasManyCountAssociationsMixin;
  // user hasMany session via user_id
  sessions!: session[];
  getSessions!: Sequelize.HasManyGetAssociationsMixin<session>;
  setSessions!: Sequelize.HasManySetAssociationsMixin<session, sessionId>;
  addSession!: Sequelize.HasManyAddAssociationMixin<session, sessionId>;
  addSessions!: Sequelize.HasManyAddAssociationsMixin<session, sessionId>;
  createSession!: Sequelize.HasManyCreateAssociationMixin<session>;
  removeSession!: Sequelize.HasManyRemoveAssociationMixin<session, sessionId>;
  removeSessions!: Sequelize.HasManyRemoveAssociationsMixin<session, sessionId>;
  hasSession!: Sequelize.HasManyHasAssociationMixin<session, sessionId>;
  hasSessions!: Sequelize.HasManyHasAssociationsMixin<session, sessionId>;
  countSessions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof user {
    return user.init({
    id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "email"
    },
    emailVerified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: true,
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
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
