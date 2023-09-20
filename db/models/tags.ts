import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { notes, notesId } from './notes';
import type { tag_defs, tag_defsId } from './tag_defs';

export interface tagsAttributes {
  id: number;
  note_id: number;
  tagdef_id: number;
}

export type tagsPk = "id";
export type tagsId = tags[tagsPk];
export type tagsOptionalAttributes = "id";
export type tagsCreationAttributes = Optional<tagsAttributes, tagsOptionalAttributes>;

export class tags extends Model<tagsAttributes, tagsCreationAttributes> implements tagsAttributes {
  id!: number;
  note_id!: number;
  tagdef_id!: number;

  // tags belongsTo notes via note_id
  note!: notes;
  getNote!: Sequelize.BelongsToGetAssociationMixin<notes>;
  setNote!: Sequelize.BelongsToSetAssociationMixin<notes, notesId>;
  createNote!: Sequelize.BelongsToCreateAssociationMixin<notes>;
  // tags belongsTo tag_defs via tagdef_id
  tagdef!: tag_defs;
  getTagdef!: Sequelize.BelongsToGetAssociationMixin<tag_defs>;
  setTagdef!: Sequelize.BelongsToSetAssociationMixin<tag_defs, tag_defsId>;
  createTagdef!: Sequelize.BelongsToCreateAssociationMixin<tag_defs>;

  static initModel(sequelize: Sequelize.Sequelize): typeof tags {
    return tags.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    note_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'notes',
        key: 'id'
      }
    },
    tagdef_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tag_defs',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'tags',
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
        name: "tags_FK",
        using: "BTREE",
        fields: [
          { name: "note_id" },
        ]
      },
      {
        name: "tags_FK_1",
        using: "BTREE",
        fields: [
          { name: "tagdef_id" },
        ]
      },
    ]
  });
  }
}
