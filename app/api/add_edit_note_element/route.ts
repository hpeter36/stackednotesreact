import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "@/utils/api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function POST(request: Request) {
  try {
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
    if (!note_id) {
      // insert new note
      const [insertedId, affectedRows] = await sequelizeAdapter.query(
        `insert into notes (parent_id, note, note_order)
          select :parent_id, :note, (select ifnull((select (note_order + 1) from notes where parent_id = :parent_id order by note_order desc limit 1), 0) as note_order)`,
        { replacements: { parent_id: parent_id, note: note } }
      );
      noteId = insertedId as any;
    }

    // update note
    else {
      const resUpdate = await sequelizeAdapter.query(
        `update notes set note = :note where id= :note_id`,
        { replacements: { note_id: note_id, note: note } }
      );
    }

    // get added/updated row
    const results = await sequelizeAdapter.query(
      `select * from notes where id = :noteId`,
      {
        plain: false,
        raw: true,
        type: QueryTypes.SELECT,
        replacements: { noteId: noteId },
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
