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
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
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

  @Roles('USER')
  @Get()
  getAllTasks(@GetUser() user: PayloadUser) {
    return this.taskService.getTasks(user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: PayloadUser,
  ) {
    return this.taskService.update(id, updateTaskDto, user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.taskService.remove(+id);
  // }
}
