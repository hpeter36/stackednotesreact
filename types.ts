export type ApiResponse = {
	data: Object;
	status: string;
  };

export enum EnumApiResponseStatus {
	STATUS_ERROR_MISSING_PARAM,
	STATUS_ERROR_INVALID_PARAM,
	STATUS_ERROR_SERVER_ERROR,
	STATUS_ERROR_NOT_AUTHENTICATED,
	STATUS_OK,
  }