import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    files?: Express.Multer.File[],
  ): Promise<Post> {
    if (files && files.length > 6) {
      throw new BadRequestException('No máximo 6 imagens por postagem');
    }

    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await Promise.all(
        files.map((file) => this.s3Service.upload(file)),
      );
    }

    const post = this.postRepository.create({
      ...createPostDto,
      images: imageUrls,
    });

    return this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({ relations: ['author'] });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    files?: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    if (files && files.length > 0) {
      const currentImages = post.images || [];
      if (currentImages.length + files.length > 6) {
        throw new BadRequestException('No máximo 6 imagens por postagem');
      }

      const newUrls = await Promise.all(
        files.map((file) => this.s3Service.upload(file)),
      );
      updatePostDto['images'] = [...currentImages, ...newUrls];
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: string): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Remove images from S3
    if (post.images && post.images.length > 0) {
      await Promise.all(
        post.images.map((url) => this.s3Service.delete(url)),
      );
    }

    await this.postRepository.remove(post);
    return { message: 'Post removido com sucesso' };
  }
}
