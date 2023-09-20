import { NextResponse } from "next/server";
import { EnumApiResponseStatus } from "@/types";

const getApiResponse = (dataIn: any, respStatus: EnumApiResponseStatus, respStatusCode: number) =>
{
  return NextResponse.json(
	{
	  data: dataIn,
	  status: EnumApiResponseStatus[respStatus],
	},
	{ status: respStatusCode }
  );
}

export {getApiResponse}