import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";
import { dbDeleteTagFromNote } from "@/db/sql_queries";

export async function DELETE(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when deleting tag from note, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    // get input
    const { note_id, tag_name } = await request.json();

    // input validation
    if (!note_id)
      return getApiResponse(
        "Error when deleting tag from note, no 'note_id' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    if (!tag_name)
      return getApiResponse(
        "Error when deleting tag from note, no 'tag_name' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    // delete db. op.
    const affRowsDel = await dbDeleteTagFromNote(note_id, tag_name, user.id);
    if (affRowsDel === 0)
      return getApiResponse(
        "Error when deleting tag from note, the tag was not found on the note!",
        EnumApiResponseStatus.STATUS_ERROR_DB_RESOURCE_NOT_FOUND,
        404
      );

    // return data
    return getApiResponse(
      { affectedRows: affRowsDel },
      EnumApiResponseStatus.STATUS_OK,
      200
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
