import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { tags, tagsId } from './tags';

export interface tag_defsAttributes {
  id: number;
  name: string;
  usage_count: number;
}

export type tag_defsPk = "id";
export type tag_defsId = tag_defs[tag_defsPk];
export type tag_defsOptionalAttributes = "id" | "usage_count";
export type tag_defsCreationAttributes = Optional<tag_defsAttributes, tag_defsOptionalAttributes>;

export class tag_defs extends Model<tag_defsAttributes, tag_defsCreationAttributes> implements tag_defsAttributes {
  id!: number;
  name!: string;
  usage_count!: number;

  // tag_defs hasMany tags via tagdef_id
  tags!: tags[];
  getTags!: Sequelize.HasManyGetAssociationsMixin<tags>;
  setTags!: Sequelize.HasManySetAssociationsMixin<tags, tagsId>;
  addTag!: Sequelize.HasManyAddAssociationMixin<tags, tagsId>;
  addTags!: Sequelize.HasManyAddAssociationsMixin<tags, tagsId>;
  createTag!: Sequelize.HasManyCreateAssociationMixin<tags>;
  removeTag!: Sequelize.HasManyRemoveAssociationMixin<tags, tagsId>;
  removeTags!: Sequelize.HasManyRemoveAssociationsMixin<tags, tagsId>;
  hasTag!: Sequelize.HasManyHasAssociationMixin<tags, tagsId>;
  hasTags!: Sequelize.HasManyHasAssociationsMixin<tags, tagsId>;
  countTags!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tag_defs {
    return tag_defs.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'tag_defs',
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
    ]
  });
  }
}
