// src/common/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from './responses';
import {
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsCatcher implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message : string | [] = 'Internal server error' ;
    let error = "InternalServer Error"
    if (exception instanceof BadRequestException) {
      console.log(exception.getResponse())
      return response.status(400).json(exception.getResponse());
    } else if (exception instanceof HttpException) {
            console.log('2')

      status = exception.getStatus();
      message = exception.message || message;
      error = exception.name
    } else if (exception instanceof PrismaClientKnownRequestError) {
            console.log('3')

      error = 'Not Found'
      status = HttpStatus.NOT_FOUND;
      message = 'Requested Resource was not Found';
    } else if (exception instanceof ValidationError) {
            console.log('4')

      status = HttpStatus.BAD_REQUEST;
      message = exception.value;
      error = "Validation Error"
    } else if (exception instanceof Error) {
            console.log('5')

status = 400;
      message = exception.message;
      error = "Error"
    }
    console.log(exception);

    response.status(status).json(errorResponse(error,message, status));
  }
}
