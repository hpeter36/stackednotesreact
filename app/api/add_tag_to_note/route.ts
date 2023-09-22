import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter, dbOrm } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";

export async function POST(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when adding tag to note, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    // get input
    const { searchParams } = new URL(request.url);

    const note_id = searchParams.get("note_id");
    const tag_name = searchParams.get("tag_name");

    // input validation
    if (!note_id)
      return getApiResponse(
        "Error when adding tag to note, no 'note_id' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    if (!tag_name)
      return getApiResponse(
        "Error when adding tag to note, no 'tag_name' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    // és ha a note id, tagdef nem létezik??? !!!

    // check if not belongs to the user
    const foundNote = await dbOrm.notes.findOne({
      where: { user_id: user.id, id: note_id },
    }); // and connection
    if (!foundNote)
      return getApiResponse(
        "Error when adding tag to note, the note does not belong to the user or the note does not exist",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHORIZED,
        403
      );

    // check if note has the tag already
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
          user_id: user.id,
        },
      }
    );
    let resIds = results as any[];
    if (resIds[0]["c"] > 0)
      return getApiResponse(
        "Error when adding tag to note, the tag already exists on the note!",
        EnumApiResponseStatus.STATUS_ERROR_CREATED_ALREADY,
        400
      );

    // insert tag to note
    const [resInsert, metaIns] = await sequelizeAdapter.query(
      `insert into tags (note_id, tagdef_id) values(:note_id, (select id from tag_defs where name = :tag_name))`,
      { replacements: { note_id: note_id, tag_name: tag_name } }
    );
    //console.log(resInsert) // inserted id
    //console.log(metaIns)  // affected rows

    // update count for tag def.
    const resUpdate = await sequelizeAdapter.query(
      `update tag_defs set usage_count = (select count(*) from tags where tagdef_id = (select id from tag_defs where name = :tag_name)) where name = :tag_name`,
      { replacements: { tag_name: tag_name } }
    );

    // return data
    return getApiResponse(
      { affectedRows: metaIns },
      EnumApiResponseStatus.STATUS_CREATED,
      201
    );
  } catch (e) {
    // error handling
    // itt logolni kell db-be !!!
    if (typeof e === "string")
      return getApiResponse(
        e,
        EnumApiResponseStatus.STATUS_ERROR_SERVER_ERROR,
        500
      );
    else if (e instanceof Error)
      return getApiResponse(
        e.message,
        EnumApiResponseStatus.STATUS_ERROR_SERVER_ERROR,
        500
      );
  }
}
