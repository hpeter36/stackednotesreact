import type { Sequelize } from "sequelize";
import { notes as _notes } from "./notes";
import type { notesAttributes, notesCreationAttributes } from "./notes";

export {
  _notes as notes,
};

export type {
  notesAttributes,
  notesCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const notes = _notes.initModel(sequelize);

  notes.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(notes, { as: "notes", foreignKey: "user_id"});

  return {
    notes: notes,
  };
}
