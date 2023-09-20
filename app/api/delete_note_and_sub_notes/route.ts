import { NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import { getApiResponse } from "@/utils/api_helpers";
import { sequelizeAdapter } from "@/db";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function DELETE(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);

    const note_id_from = searchParams.get("note_id_from");

    // input validation
    if (!note_id_from)
      return getApiResponse(
        "Error when deleting note and subnotes, no 'note_id_from' is specified!",
        EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM,
        400
      );

    const results = await sequelizeAdapter.query(
      `with RECURSIVE cte AS 
          (
          SELECT n.id
          FROM notes n
          WHERE n.id = ${note_id_from}
          UNION ALL
          SELECT n.id
          FROM notes n JOIN cte c ON n.parent_id = c.id
          )
          select id
          FROM cte`,
      { plain: false, raw: true, type: QueryTypes.SELECT, replacements: {note_id_from: note_id_from}}
    );

    if (results.length === 0)
      return getApiResponse(
        "Error when deleting note and subnotes, the note may not be exists!",
        EnumApiResponseStatus.STATUS_ERROR_DB_RESOURCE_NOT_FOUND,
        404
      );

    let resIds = results as any[];
    resIds = resIds.map((r) => r.id);

    // delete tags
    let [resDel, meta] = await sequelizeAdapter.query(
      `delete from tags where note_id in (:to_del_ids)`, {replacements: {to_del_ids: resIds.join(",")}}
    );

    // delete notes
    [resDel, meta] = await sequelizeAdapter.query(
      `delete from notes where id in (:to_del_ids)`, {replacements: {to_del_ids: resIds.join(",")}}
    );

    // return data
    return getApiResponse("", EnumApiResponseStatus.STATUS_OK, 200);
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
