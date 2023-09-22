import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "../api_helpers";
import { sequelizeAdapter } from "@/db";
import { getUserOnServer } from "../api_helpers";

import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function GET(request: Request) {
  try {

     // user checking
     const user = await getUserOnServer()
     if (!user)
       return getApiResponse(
         "Error when getting notes, the user is not authenticated",
         EnumApiResponseStatus.STATUS_ERROR_NOT_AUTHENTICATED,
         401
       );
       
    // get input
    const { searchParams } = new URL(request.url);
    let from_note_id = searchParams.get("from_note_id");

    if (!from_note_id) from_note_id = "0";

    const results = await sequelizeAdapter.query(
      `with RECURSIVE cte AS 
      (
      SELECT n.id, n.parent_id, n.note, n.note_order, n.user_id
      FROM notes n
      WHERE n.id = :from_note_id
      UNION ALL
      SELECT n.id, n.parent_id, n.note, n.note_order, n.user_id
      FROM notes n JOIN cte c ON n.parent_id = c.id
      )
      select id, parent_id, note, note_order
      FROM cte where user_id = :user_id order by parent_id asc, note_order asc`,
      { plain: false, raw: true, type: QueryTypes.SELECT, replacements: {from_note_id: from_note_id, user_id: user.id} }
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
