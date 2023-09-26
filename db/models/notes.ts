import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { user, userId } from './user';

export interface notesAttributes {
  id: number;
  parent_id?: number;
  note: string;
  note_order: number;
  user_id: string;
  note_date: Date;
}

export type notesPk = "id";
export type notesId = notes[notesPk];
export type notesOptionalAttributes = "id" | "parent_id" | "note_order" | "note_date";
export type notesCreationAttributes = Optional<notesAttributes, notesOptionalAttributes>;

export class notes extends Model<notesAttributes, notesCreationAttributes> implements notesAttributes {
  id!: number;
  parent_id?: number;
  note!: string;
  note_order!: number;
  user_id!: string;
  note_date!: Date;

  // notes belongsTo user via user_id
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(sequelize: Sequelize.Sequelize): typeof notes {
    return notes.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    note: {
      type: DataTypes.STRING(8000),
      allowNull: false
    },
    note_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    note_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'notes',
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
        name: "notes_FK",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
