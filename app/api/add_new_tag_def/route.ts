import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getUserOnServer } from "../api_helpers";
import { dbAddTagDef, dbIsTagDefExists } from "@/db/sql_queries";

export async function POST(request: Request) {
  try {
    // user checking
    const user = await getUserOnServer();
    if (!user)
      return getApiResponse(
        "Error when adding new tagdef, the user is not authenticated",
        EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
        401
      );

    // get input
    const { tag_name } = await request.json();

    // input validation
    if (!tag_name)
      return getApiResponse(
        "Error when adding new tagdef, no 'tag_name' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    // check for existing tag name
    const isTagDefExist = await dbIsTagDefExists(tag_name);
    if (isTagDefExist)
      return getApiResponse(
        "Error when adding new tagdef, the tagdef already exists!",
        EnumApiResponseStatus.STATUS_ERROR_CREATED_ALREADY,
        400
      );

    // insert new tagdef
    const affectedRows = await dbAddTagDef(tag_name)

    // return data
    return getApiResponse(
      { affectedRows: affectedRows },
      EnumApiResponseStatus.STATUS_CREATED,
      201
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
