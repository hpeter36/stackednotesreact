import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "@/utils/api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function POST(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);

    const tag_name = searchParams.get("tag_name");

    // input validation
    if (!tag_name)
      return getApiResponse(
        "Error when adding new tagdef, no 'tag_name' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    // check for existing tag name
    const results = await sequelizeAdapter.query(
      `select count(*) as c from tag_defs where name = :tag_name`,
      {
        plain: false,
        raw: true,
        type: QueryTypes.SELECT,
        replacements: { tag_name: tag_name },
      }
    );
    let resIds = results as any[];
    if (resIds[0]["c"] > 0)
      return getApiResponse(
        "Error when adding new tagdef, the tagdef already exists!",
        EnumApiResponseStatus.STATUS_ERROR_CREATED_ALREADY,
        400
      );

    // insert new tagdef
    const [insertedId, affectedRows] = await sequelizeAdapter.query(
      `Insert into tag_defs (name, usage_count) values(:tag_name,0)`,
      { replacements: { tag_name: tag_name } }
    );

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
