import { NextResponse } from "next/server";
import { ApiResponse, EnumApiResponseStatus } from "../../../types";

export async function GET(request: Request) {
  try {
    // get input
    const { searchParams } = new URL(request.url);

    const note_id = searchParams.get("note_id");
    const tag_name = searchParams.get("tag_name");

    // input validation
    if (!note_id) {
      return NextResponse.json(
        {
          data: "No 'note_id' is specified!",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    if (!tag_name) {
      return NextResponse.json(
        {
          data: "No 'tag_name' is specified!",
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_MISSING_PARAM
            ],
        },
        { status: 400 }
      );
    }

    // construct uri
    let uriStr = `http://${process.env.DATA_SERVER}:${process.env.DATA_SERVER_PORT}/api/v1/resources/delete_tag_from_note?note_id=${note_id}&tag_name=${tag_name}`;

    const respData = await fetch(uriStr).then((res) => res.json());

    // return data
    return NextResponse.json(
      {
        data: respData,
        status: EnumApiResponseStatus[EnumApiResponseStatus.STATUS_OK],
      },
      { status: 200 }
    );
  } catch (e) {
    // error handling
    if (typeof e === "string")
      // itt logolni kell db-be !!!
      return NextResponse.json(
        {
          data: e,
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_SERVER_ERROR
            ],
        },
        { status: 500 }
      );
    else if (e instanceof Error)
      return NextResponse.json(
        {
          data: e.message,
          status:
            EnumApiResponseStatus[
              EnumApiResponseStatus.STATUS_ERROR_SERVER_ERROR
            ],
        },
        { status: 500 }
      );
  }
}
