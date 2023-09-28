import type { Sequelize } from "sequelize";
import { account as _account } from "./account";
import type { accountAttributes, accountCreationAttributes } from "./account";
import { notes as _notes } from "./notes";
import type { notesAttributes, notesCreationAttributes } from "./notes";
import { session as _session } from "./session";
import type { sessionAttributes, sessionCreationAttributes } from "./session";
import { tag_defs as _tag_defs } from "./tag_defs";
import type { tag_defsAttributes, tag_defsCreationAttributes } from "./tag_defs";
import { tags as _tags } from "./tags";
import type { tagsAttributes, tagsCreationAttributes } from "./tags";
import { themes as _themes } from "./themes";
import type { themesAttributes, themesCreationAttributes } from "./themes";
import { user as _user } from "./user";
import type { userAttributes, userCreationAttributes } from "./user";
import { verificationtoken as _verificationtoken } from "./verificationtoken";
import type { verificationtokenAttributes, verificationtokenCreationAttributes } from "./verificationtoken";

export {
  _account as account,
  _notes as notes,
  _session as session,
  _tag_defs as tag_defs,
  _tags as tags,
  _themes as themes,
  _user as user,
  _verificationtoken as verificationtoken,
};

export type {
  accountAttributes,
  accountCreationAttributes,
  notesAttributes,
  notesCreationAttributes,
  sessionAttributes,
  sessionCreationAttributes,
  tag_defsAttributes,
  tag_defsCreationAttributes,
  tagsAttributes,
  tagsCreationAttributes,
  themesAttributes,
  themesCreationAttributes,
  userAttributes,
  userCreationAttributes,
  verificationtokenAttributes,
  verificationtokenCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const account = _account.initModel(sequelize);
  const notes = _notes.initModel(sequelize);
  const session = _session.initModel(sequelize);
  const tag_defs = _tag_defs.initModel(sequelize);
  const tags = _tags.initModel(sequelize);
  const themes = _themes.initModel(sequelize);
  const user = _user.initModel(sequelize);
  const verificationtoken = _verificationtoken.initModel(sequelize);

  tags.belongsTo(notes, { as: "note", foreignKey: "note_id"});
  notes.hasMany(tags, { as: "tags", foreignKey: "note_id"});
  tags.belongsTo(tag_defs, { as: "tagdef", foreignKey: "tagdef_id"});
  tag_defs.hasMany(tags, { as: "tags", foreignKey: "tagdef_id"});
  account.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(account, { as: "accounts", foreignKey: "user_id"});
  notes.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(notes, { as: "notes", foreignKey: "user_id"});
  session.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(session, { as: "sessions", foreignKey: "user_id"});

  return {
    account: account,
    notes: notes,
    session: session,
    tag_defs: tag_defs,
    tags: tags,
    themes: themes,
    user: user,
    verificationtoken: verificationtoken,
  };
}
