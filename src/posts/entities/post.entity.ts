import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  author: string;

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
