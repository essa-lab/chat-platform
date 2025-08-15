import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ErrorBody, PaginatedResponse, ResponseBody } from 'src/common/response-body';

import { User } from './user.model';
import { UserService } from './user.service';
import { UserListDto } from './dto/user-list.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

@ApiBearerAuth('token')
@Get(':userId')
@ApiParam({
  name: 'userId',
  required: true,
  description: 'The ID of the User',
  type: Number,
})
@ApiOperation({ summary: 'Get User by ID' })
@ApiResponse({
  status: 200,
  description: 'User object with related Profile',
  type: ResponseBody, 
})
@ApiResponse({
  status: 404,
  description: 'User with ID not found',
  type: ErrorBody,
})
  async findOne(@Param('userId') userId: string): Promise<ResponseBody<User>> {
    const user = await this.userService.getUser(Number(userId));
    return new ResponseBody(true, 'User retrieved successfully', user);
  }

@ApiBearerAuth('token')
@Get()
@ApiOperation({ summary: 'Get paginated list of users' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'perPage', required: false, type: Number, example: 10 })
@ApiQuery({ name: 'sortBy', required: false, type: String, example: 'username' })
@ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'asc' })
@ApiResponse({
  status: 200,
  description: 'Paginated list of users',
  type: PaginatedResponse,
})
  async getUsers(@Query() query: UserListDto) {
    

    const users = await this.userService.getUsersList(query);

    return new PaginatedResponse(users.meta,"User List",users.users)
  }
}