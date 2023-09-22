import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth/next";
import { dbOrm } from "@/db";
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

const getUserOnServer = async () => {
	const session = await getServerSession(authOptions);
    if (!session)
		return undefined
	const user = await dbOrm.user.findOne({
		where: { email: session?.user?.email! },
		});
	if (!user)
		return undefined
	return user	
}

export {getUserOnServer, getApiResponse}