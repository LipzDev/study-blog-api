import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @Column()
  title: string;

  @CreateDateColumn()
  date: Date;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column('text')
  text: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
