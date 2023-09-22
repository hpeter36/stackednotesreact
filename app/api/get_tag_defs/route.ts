import { NextResponse } from "next/server";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getApiResponse } from "../api_helpers";
import { dbOrm } from "@/db";
import { getUserOnServer } from "../api_helpers";
import { dbOrmGetAllTagDefs } from "@/db/sql_queries";

export async function GET(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when getting tag defs, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    const tagDefs = dbOrmGetAllTagDefs()
    return getApiResponse(tagDefs, EnumApiResponseStatus.STATUS_OK, 200);
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
