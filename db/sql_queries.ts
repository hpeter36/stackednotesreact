import { sequelizeAdapter, dbOrm } from ".";
import { QueryTypes } from "sequelize";

export async function dbGetNotes(from_note_id: string, user_id: string) {
  const results = await sequelizeAdapter.query(
    `with RECURSIVE cte AS 
		(
		SELECT n.id, n.parent_id, n.note, n.note_order, n.user_id
		FROM notes n
		WHERE n.id = :from_note_id
		UNION ALL
		SELECT n.id, n.parent_id, n.note, n.note_order, n.user_id
		FROM notes n JOIN cte c ON n.parent_id = c.id
		)
		select id, parent_id, note, note_order
		FROM cte where user_id = :user_id order by parent_id asc, note_order asc`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { from_note_id: from_note_id, user_id: user_id },
    }
  );
  return results;
}

export async function dbGetNoteAndSubNoteIds(
  note_id_from: string,
  user_id: string
) {
  const results = await sequelizeAdapter.query(
    `with RECURSIVE cte AS 
			(
			SELECT n.id, n.user_id
			FROM notes n
			WHERE n.id = :note_id_from
			UNION ALL
			SELECT n.id, n.user_id
			FROM notes n JOIN cte c ON n.parent_id = c.id
			)
			select c.id
			FROM cte c where c.user_id = :user_id`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { note_id_from: note_id_from, user_id: user_id },
    }
  );
  return results;
}

export async function dbAddNewNote(
  parent_id: string,
  note: string,
  user_id: string
) {
  const [insertedId, affectedRows] = await sequelizeAdapter.query(
    `insert into notes (parent_id, note, note_order, user_id) select :parent_id, :note, ifnull((select (note_order + 1) from notes where parent_id = :parent_id order by note_order desc limit 1), 0), :user_id`,
    { replacements: { parent_id: parent_id, note: note, user_id: user_id } }
  );
  return insertedId as any;
}

export async function dbAddTagToNote(note_id: string, tag_name: string) {
  const [resInsert, metaIns] = await sequelizeAdapter.query(
    `insert into tags (note_id, tagdef_id) values(:note_id, (select id from tag_defs where name = :tag_name))`,
    { replacements: { note_id: note_id, tag_name: tag_name } }
  );

  //console.log(resInsert) // inserted id
  //console.log(metaIns)  // affected rows

  return metaIns; // affectedRows
}

export async function dbIncrementTagDefCount(tag_name: string) {
  const resUpdate = await sequelizeAdapter.query(
    `update tag_defs set usage_count = (select count(*) from tags where tagdef_id = (select id from tag_defs where name = :tag_name)) where name = :tag_name`,
    { replacements: { tag_name: tag_name } }
  );
}

export async function dbOrmGetNoteWithId(note_id: string, user_id: string) {
  const foundNote = await dbOrm.notes.findOne({
    where: { user_id: user_id, id: note_id }, // and connection
  });
  return foundNote;
}

export async function dbOrmGetAllTagDefs() {
  const tagDefs = await dbOrm.tag_defs.findAll();
  return tagDefs
}

export async function dbGetNoteWithId(note_id: string, user_id: string) {
  const results = await sequelizeAdapter.query(
    `select * from notes where id = :noteId and user_id = :user_id`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { noteId: note_id, user_id: user_id },
    }
  );
  return results;
}

export async function dbGetNotesWithTag(tag_name: string, user_id: string) {
  const results = await sequelizeAdapter.query(
    `select n.id, n.parent_id, n.note, n.note_order from notes n join tags t on n.id = t.note_id join tag_defs td on t.tagdef_id = td.id where td.name = :tag_name and n.user_id = :user_id`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { tag_name: tag_name, user_id: user_id },
    }
  );
  return results;
}

export async function dbGetAllTagsFromNote(
  from_note_id: string,
  user_id: string
) {
  const results = await sequelizeAdapter.query(
    `with RECURSIVE cte AS 
		(
		SELECT n.id,  n.parent_id, n.note_order, n.user_id
		FROM notes n
		WHERE n.id = :from_note_id
		UNION ALL
		SELECT n.id, n.parent_id, n.note_order, n.user_id
		FROM notes n JOIN cte c ON n.parent_id = c.id
		)
		select c.id as note_id, c.parent_id, c.note_order, td.name as tag_name
		FROM cte c
		inner join tags t on c.id = t.note_id
		inner join tag_defs td on t.tagdef_id = td.id 
		where c.user_id = :user_id
		order by c.parent_id asc, c.note_order asc`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { from_note_id: from_note_id, user_id: user_id },
    }
  );
  return results;
}

export async function dbUpdateNoteWithId(
  note_id: string,
  note: string,
  user_id: string
) {
  const resUpdate = await sequelizeAdapter.query(
    `update notes set note = :note where id= :note_id and user_id = :user_id`,
    { replacements: { note_id: note_id, note: note, user_id: user_id } }
  );
  return resUpdate;
}

export async function dbDeleteTagsWithNoteIds(noteIdsArr: any[]) {
  let [resDel, meta] = await sequelizeAdapter.query(
    `delete from tags where note_id in (:to_del_ids)`,
    { replacements: { to_del_ids: noteIdsArr.join(",") } }
  );

  //return [resDel, meta]; !!! mi legyen a return val
}

export async function dbDeleteNotesWithNoteIds(
  noteIdsArr: any[],
  user_id: string
) {
  const [resDel, meta] = await sequelizeAdapter.query(
    `delete from notes where id in (:to_del_ids) and user_id = :user_id`,
    { replacements: { to_del_ids: noteIdsArr.join(","), user_id: user_id } }
  );
  //return [resDel, meta]; !!! mi legyen a return val
}

export async function dbIsNoteHasTagName(
  note_id: string,
  tag_name: string,
  user_id: string
) {
  const results = await sequelizeAdapter.query(
    `select count(*) as c from notes n 
		inner join tags t on n.id = t.note_id 
		inner join tag_defs td  on t.tagdef_id  = td.id
		where n.id  = :note_id and td.name = :tag_name and n.user_id = :user_id`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: {
        note_id: note_id,
        tag_name: tag_name,
        user_id: user_id,
      },
    }
  );
  let resIds = results as any[];
  if (resIds[0]["c"] > 0) return true;
  return false;
}

export async function dbDeleteTagFromNote(
  note_id: string,
  tag_name: string,
  user_id: string
) {
  const [results, meta] = await sequelizeAdapter.query(
    `delete t.* from tags t 
		inner join tag_defs td on t.tagdef_id = td.id 
		inner join notes n on t.note_id = n.id  
		where t.note_id = :note_id and td.name = :tag_name and n.user_id = :user_id`,
    { replacements: { note_id: note_id, tag_name: tag_name, user_id: user_id } }
  );
  const res = results as any;
  return res["affectedRows"];
}

export async function dbIsTagDefExists(tag_name: string) {
  const results = await sequelizeAdapter.query(
    `select count(*) as c from tag_defs where name = :tag_name`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { tag_name: tag_name },
    }
  );
  let resIds = results as any[];
  if (resIds[0]["c"] > 0) return true;
  return false;
}

export async function dbAddTagDef(tag_name: string) {
  const [insertedId, affectedRows] = await sequelizeAdapter.query(
    `Insert into tag_defs (name, usage_count) values(:tag_name,0)`,
    { replacements: { tag_name: tag_name } }
  );
  return affectedRows;
}

export async function dbGetDbTablesForUser(user_id: string) {
  let res: {
    notes: object[];
    tags: object[];
    tagDefs: object[];
  } = { notes: [], tags: [], tagDefs: [] };

  // get notes
  const notesDbData = await sequelizeAdapter.query(
    `select * from notes where user_id = :user_id`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { user_id: user_id },
    }
  );
  res.notes = notesDbData;

  // get tags
  const tagsDbData = await sequelizeAdapter.query(
    `select t.* from tags t inner join notes n on n.id = t.note_id where n.user_id = :user_id`,
    {
      plain: false,
      raw: true,
      type: QueryTypes.SELECT,
      replacements: { user_id: user_id },
    }
  );
  res.tags = tagsDbData;

  // get tagdefs
  const tagDefsDbData = await sequelizeAdapter.query(`select * from tag_defs`, {
    plain: false,
    raw: true,
    type: QueryTypes.SELECT,
  });
  res.tagDefs = tagDefsDbData;

  return res;
}
