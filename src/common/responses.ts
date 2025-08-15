import { ErrorBody, ResponseBody } from "./response-body";

export function successResponse<T>(data: T, message: string): ResponseBody<T> {
  return new ResponseBody<T>(true,  message ,data);
}

export function errorResponse(error:string,message: string|[],code:number): ErrorBody<{}> {
  return new ErrorBody<{}>(error, message,code);
}


