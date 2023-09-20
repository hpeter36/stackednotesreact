import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getApiResponse } from "@/utils/api_helpers";
import { sequelizeAdapter } from "@/db";

export async function GET(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);
    const tag_name = searchParams.get("tag_name");

    // input validation
    if (!tag_name)
      return getApiResponse(
        "Error when getting notes with tag, no 'tag_name' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    const results = await sequelizeAdapter.query(
      `select n.id, n.parent_id, n.note, n.note_order from notes n join tags t on n.id = t.note_id join tag_defs td on t.tagdef_id = td.id where td.name = :tag_name`,
      { plain: false, raw: true, type: QueryTypes.SELECT, replacements: { tag_name: tag_name}}
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
