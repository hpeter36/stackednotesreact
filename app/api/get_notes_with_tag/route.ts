import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter } from "@/db";
import { getUserOnServer } from "../api_helpers";
import { dbGetNotesWithTag } from "@/db/sql_queries";

export async function GET(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when getting notes with tag, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

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

    // exec query
    const results = await dbGetNotesWithTag(tag_name, user.id);

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
