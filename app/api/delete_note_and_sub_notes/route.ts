import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";

import { dbGetNoteAndSubNoteIds, dbDeleteTagsWithNoteIds, dbDeleteNotesWithNoteIds } from "@/db/sql_queries";

export async function DELETE(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when deleting note and subnotes, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    // get input
    const {note_id_from} = await request.json()

    // input validation
    if (!note_id_from)
      return getApiResponse(
        "Error when deleting note and subnotes, no 'note_id_from' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    // get note id-s to delete
    const results = await dbGetNoteAndSubNoteIds(note_id_from, user.id)
    if (results.length === 0)
      return getApiResponse(
        "Error when deleting note and subnotes, the note may not be exists!",
        EnumApiResponseStatus.STATUS_ERROR_DB_RESOURCE_NOT_FOUND,
        404
      );

    let resIds = results as any[];
    resIds = resIds.map((r) => r.id);

    // delete tags
    await dbDeleteTagsWithNoteIds(resIds)
    
    // delete notes
    await dbDeleteNotesWithNoteIds(resIds, user.id)
    

    // return data
    return getApiResponse("", EnumApiResponseStatus.STATUS_OK, 200);
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
