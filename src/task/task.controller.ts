import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {
  CreateTaskDto,
  GetTasksAdminQueryDto,
  GetTasksQueryDto,
  UpdateTaskDto,
} from './dto';
import { Roles } from 'src/auth/decorator/role.decorator';
import { jwtAcessGuard, RoleGuard } from 'src/auth/guard';
import { GetUser } from '../user/decorator';
import type { PayloadUser } from '../auth/types';

@UseGuards(jwtAcessGuard, RoleGuard)
@Roles('ADMIN', 'MANAGER')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: PayloadUser) {
    return this.taskService.create(createTaskDto, user);
  }

  @Get('ReportedTo')
  getReportedTo(@GetUser() user: PayloadUser) {
    return this.taskService.getReportedTo(user);
  }

  @Get('AssignedTo/:reportedTo')
  getAssignedTo(
    @GetUser() user: PayloadUser,
    @Param('reportedTo', ParseUUIDPipe) reportedToId: string,
  ) {
    return this.taskService.getAssignedTo(user, reportedToId);
  }

  @Roles('ADMIN', 'USER', 'MANAGER')
  @Get()
  getAllTasks(@GetUser() user: PayloadUser, @Query() query: GetTasksQueryDto) {
    return this.taskService.getTasks(user, query);
  }

  //Get Tasks of Admin
  @Roles('ADMIN')
  @Get('admin')
  getAllTasksAdmin(
    @GetUser('sub') userId: string,
    @Query() query: GetTasksAdminQueryDto,
  ) {
    return this.taskService.getTasksAdmin(userId, query);
  }

  @Roles('ADMIN', 'MANAGER', 'USER')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: PayloadUser,
  ) {
    return this.taskService.update(id, updateTaskDto, user);
  }

  @Roles('ADMIN')
  @Get(':id')
  getUsersWithTasks(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.getUserWithTasks(id);
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.taskService.remove(+id);
  // }
}
