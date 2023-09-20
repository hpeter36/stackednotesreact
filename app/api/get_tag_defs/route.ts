import { NextResponse } from "next/server";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";
import { getApiResponse } from "@/utils/api_helpers";
import { dbOrm } from "@/db";

export async function GET(request: Request) {
  try {
    const tagDefs = await dbOrm.tag_defs.findAll();
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
