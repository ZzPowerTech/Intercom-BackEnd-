import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { S3Service } from '../s3/s3.service';

const MAX_TOTAL_UPLOAD_BYTES = 10 * 1024 * 1024;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createPostDto: CreatePostDto & { authorId: string },
    files?: Express.Multer.File[],
  ): Promise<Post> {
    if (files && files.length > 6) {
      throw new BadRequestException('No máximo 6 imagens por postagem');
    }

    if (files && this.getTotalUploadSize(files) > MAX_TOTAL_UPLOAD_BYTES) {
      throw new BadRequestException('O tamanho total do upload excede 10MB');
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

    const savedPost = await this.postRepository.save(post);
    return this.withPublicImageUrls(savedPost);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      relations: { author: true },
      select: { author: { id: true, name: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = posts.map((post) => this.withPublicImageUrls(post));

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { author: true },
      select: { author: { id: true, name: true } },
    });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    return this.withPublicImageUrls(post);
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este post',
      );
    }

    if (files && files.length > 0) {
      const currentImages = post.images || [];
      if (currentImages.length + files.length > 6) {
        throw new BadRequestException('No máximo 6 imagens por postagem');
      }

      if (this.getTotalUploadSize(files) > MAX_TOTAL_UPLOAD_BYTES) {
        throw new BadRequestException('O tamanho total do upload excede 10MB');
      }

      const newUrls = await Promise.all(
        files.map((file) => this.s3Service.upload(file)),
      );
      updatePostDto['images'] = [...currentImages, ...newUrls];
    }

    Object.assign(post, updatePostDto);
    const savedPost = await this.postRepository.save(post);
    return this.withPublicImageUrls(savedPost);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este post',
      );
    }

    // Remove images from S3
    if (post.images && post.images.length > 0) {
      await Promise.all(post.images.map((url) => this.s3Service.delete(url)));
    }

    await this.postRepository.remove(post);
    return { message: 'Post removido com sucesso' };
  }

  private getTotalUploadSize(files: Express.Multer.File[]): number {
    return files.reduce((total, file) => total + file.size, 0);
  }

  private withPublicImageUrls(post: Post): Post {
    if (!post.images || post.images.length === 0) {
      return post;
    }

    const publicUrls = post.images.map((value) =>
      this.s3Service.getPublicUrl(value),
    );

    return { ...post, images: publicUrls };
  }
}
