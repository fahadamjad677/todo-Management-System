import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayloadUser } from 'src/auth/types';
import { checkCreateCommentPolicy } from './policy';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    userPayload: PayloadUser,
    taskId: string,
    createCommentDto: CreateCommentDto,
  ) {
    // Checking Userid and taskid Exists
    const [user, task] = await this.prismaService.$transaction([
      this.prismaService.user.findUnique({
        where: {
          id: userPayload.sub,
        },
        select: {
          id: true,
        },
      }),

      this.prismaService.task.findUnique({
        where: {
          id: taskId,
        },
        select: { id: true, reportedToId: true, assignedToId: true },
      }),
    ]);

    if (!user || !task) {
      throw new NotFoundException('USER OR TASK NOT FOUND');
    }

    //Now Calling The Create-comment-policy here to Validate the Business Rules
    checkCreateCommentPolicy(userPayload, task.reportedToId, task.assignedToId);

    //Creating The comment
    await this.prismaService.comment.create({
      data: {
        content: createCommentDto.content,
        userId: userPayload.sub,
        taskId: taskId,
      },
    });
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  async delete(id: string, userId: string) {
    // 1. Find the comment (only non-deleted)
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        userId: true,
      },
    });

    // 2. Check if comment exists
    if (!comment) {
      throw new NotFoundException('Comment not found or already deleted');
    }

    // 3. Authorization check (only owner can delete)
    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    // 4. Soft delete
    await this.prismaService.comment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // 5. Return clean response
    return {
      message: 'Comment deleted successfully',
    };
  }
}
