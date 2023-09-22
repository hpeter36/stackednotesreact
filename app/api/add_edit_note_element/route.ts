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
        "Error when adding/editing note element, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    // get input
    const { searchParams } = new URL(request.url);

    const note_id = searchParams.get("note_id");
    const parent_id = searchParams.get("parent_id");
    const note = searchParams.get("note");

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
      const [insertedId, affectedRows] = await sequelizeAdapter.query(
        `insert into notes (parent_id, note, note_order, user_id)
          select :parent_id, :note, (select ifnull((select (note_order + 1) from notes where parent_id = :parent_id order by note_order desc limit 1), 0) as note_order, :user_id)`,
        { replacements: { parent_id: parent_id, note: note, user_id: user.id } }
      );
      noteId = insertedId as any;
      inserted = true;
    }

    // update note
    else {
      if (!inserted) {
        // check if not belongs to the user
        const foundNote = await dbOrm.notes.findOne({
          where: { user_id: user.id, id: note_id },
        });
        if (!foundNote)
          return getApiResponse(
            "Error when adding/editing note element, the note does not belong to the user or the note does not exist",
            EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHORIZED,
            403
          );
      }

      // do the update
      const resUpdate = await sequelizeAdapter.query(
        `update notes set note = :note where id= :note_id and user_id = :user_id`,
        { replacements: { note_id: note_id, note: note, user_id: user.id } }
      );
    }

    // get added/updated row
    const results = await sequelizeAdapter.query(
      `select * from notes where id = :noteId and user_id = :user_id`,
      {
        plain: false,
        raw: true,
        type: QueryTypes.SELECT,
        replacements: { noteId: noteId, user_id: user.id  },
      }
    );
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
