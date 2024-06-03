import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StreamDto } from 'src/stream/dto';

@Injectable()
export class StreamService {
  constructor(private prisma: PrismaService) {}

  async create(dto: StreamDto) {
    console.log(dto);
  }
}
