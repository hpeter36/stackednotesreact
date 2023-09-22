import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter } from "@/db";
import { getUserOnServer } from "../api_helpers";

import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { dbGetDbTablesForUser } from "@/db/sql_queries";

export async function GET(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error getting all db. table data, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    if (user.email !== "hajdupeter24@gmail.com")
      return getApiResponse(
        "Error getting all db. table data, the user is not authorized",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHORIZED,
        403
      );

    // get db tables data
    const retRes = []
    const dbTablesData = await dbGetDbTablesForUser(user.id)
    retRes.push( {fn: "notes.json", data: dbTablesData.notes})
    retRes.push( {fn: "tags.json", data: dbTablesData.tags})
    retRes.push( {fn: "tagdefs.json", data: dbTablesData.tagDefs})

    // return data
    return getApiResponse(retRes, EnumApiResponseStatus.STATUS_OK, 200);
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
