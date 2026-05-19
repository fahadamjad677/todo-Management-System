import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto';
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
  getReportedTo(@GetUser() userRole: PayloadUser) {
    return this.taskService.getReportedTo(userRole);
  }

  @Get('AssignedTo')
  getAssignedTo(@GetUser() userRole: PayloadUser) {
    return this.taskService.getAssignedTo(userRole);
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.taskService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
  //   return this.taskService.update(+id, updateTaskDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.taskService.remove(+id);
  // }
}
