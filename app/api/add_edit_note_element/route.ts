import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter, dbOrm } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";

import { dbAddNewNote, dbOrmGetNoteWithId, dbGetNoteWithId, dbUpdateNoteWithId } from "@/db/sql_queries";

export async function POST(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when adding/editing note element, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    // get input
    const {note_id, parent_id, note} = await request.json()

    // input validation
    // update does not need parent_id
    if (!note_id && !parent_id)
      return getApiResponse(
        "Error when adding/editing note element, no 'parent_id' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    if (!note)
      return getApiResponse(
        "Error when adding/editing note element, no 'note' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    let noteId = note_id;
    let inserted = false;
    if (!note_id) {
      // insert new note
      noteId = await dbAddNewNote(parent_id!, note, user.id)
      inserted = true;
    }

    // update note
    else {
      if (!inserted) {
        // check if not belongs to the user
        const foundNote = await dbOrmGetNoteWithId(note_id, user.id)
        if (!foundNote)
          return getApiResponse(
            "Error when adding/editing note element, the note does not belong to the user or the note does not exist",
            EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHORIZED,
            403
          );
      }

      // do the update
      const resUpdate = await dbUpdateNoteWithId(note_id, note, user.id)
    }

    // get added/updated row
    const results = await dbGetNoteWithId(noteId!, user.id)
    if (results.length === 0)
      return getApiResponse(
        "Error when adding/updating note, the note cannot be found!",
        EnumApiResponseStatus.STATUS_ERROR_DB_RESOURCE_NOT_FOUND,
        404
      );

    // return data
    return getApiResponse(
      results[0],
      !note_id
        ? EnumApiResponseStatus.STATUS_CREATED
        : EnumApiResponseStatus.STATUS_OK,
      !note_id ? 201 : 200
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
