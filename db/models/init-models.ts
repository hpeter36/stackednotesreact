import type { Sequelize } from "sequelize";
import { notes as _notes } from "./notes";
import type { notesAttributes, notesCreationAttributes } from "./notes";
import { tag_defs as _tag_defs } from "./tag_defs";
import type { tag_defsAttributes, tag_defsCreationAttributes } from "./tag_defs";
import { tags as _tags } from "./tags";
import type { tagsAttributes, tagsCreationAttributes } from "./tags";
import { themes as _themes } from "./themes";
import type { themesAttributes, themesCreationAttributes } from "./themes";

export {
  _notes as notes,
  _tag_defs as tag_defs,
  _tags as tags,
  _themes as themes,
};

export type {
  notesAttributes,
  notesCreationAttributes,
  tag_defsAttributes,
  tag_defsCreationAttributes,
  tagsAttributes,
  tagsCreationAttributes,
  themesAttributes,
  themesCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const notes = _notes.initModel(sequelize);
  const tag_defs = _tag_defs.initModel(sequelize);
  const tags = _tags.initModel(sequelize);
  const themes = _themes.initModel(sequelize);

  tags.belongsTo(notes, { as: "note", foreignKey: "note_id"});
  notes.hasMany(tags, { as: "tags", foreignKey: "note_id"});
  tags.belongsTo(tag_defs, { as: "tagdef", foreignKey: "tagdef_id"});
  tag_defs.hasMany(tags, { as: "tags", foreignKey: "tagdef_id"});

  return {
    notes: notes,
    tag_defs: tag_defs,
    tags: tags,
    themes: themes,
  };
}
