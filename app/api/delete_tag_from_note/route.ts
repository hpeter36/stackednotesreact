import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "@/utils/api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function DELETE(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);

    const note_id = searchParams.get("note_id");
    const tag_name = searchParams.get("tag_name");

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

    const [results, meta] = await sequelizeAdapter.query(
      `delete t.* from tags t inner join tag_defs td on t.tagdef_id = td.id 
      where t.note_id = :note_id and td.name = :tag_name`, { replacements: {note_id: note_id, tag_name: tag_name}}
    );
    const res = results as any;
    if (res["affectedRows"] === 0)
      return getApiResponse(
        "Error when deleting tag from note, the tag was not found on the note!",
        EnumApiResponseStatus.STATUS_ERROR_DB_RESOURCE_NOT_FOUND,
        404
      );

    // return data
    return getApiResponse(results, EnumApiResponseStatus.STATUS_OK, 200);
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
