import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { User } from './entities/user.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UploadsModule],
  controllers: [UsersController],
  providers: [UsersService, ScheduledTasksService],
  exports: [UsersService],
})
export class UsersModule {}
