import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter, dbOrm } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";
import { dbOrmGetNoteWithId, dbIsNoteHasTagName, dbAddTagToNote, dbIncrementTagDefCount } from "@/db/sql_queries";

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
    const { note_id, tag_name } = await request.json();

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
    const foundNote = await dbOrmGetNoteWithId(note_id, user.id);
    if (!foundNote)
      return getApiResponse(
        "Error when adding tag to note, the note does not belong to the user or the note does not exist",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHORIZED,
        403
      );

    // check if note has the tag already
    const IsNoteHasTagName = await dbIsNoteHasTagName(
      note_id,
      tag_name,
      user.id
    );
    if (IsNoteHasTagName)
      return getApiResponse(
        "Error when adding tag to note, the tag already exists on the note!",
        EnumApiResponseStatus.STATUS_ERROR_CREATED_ALREADY,
        400
      );

    // insert tag to note
    const metaIns = await dbAddTagToNote(note_id, tag_name)

    // update count for tag def.
    await dbIncrementTagDefCount(tag_name)

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
