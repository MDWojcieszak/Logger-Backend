import { Body, Controller, Post } from '@nestjs/common';
import { StreamDto } from 'src/stream/dto';
import { StreamService } from 'src/stream/stream.service';

@Controller('stream')
export class StreamController {
  constructor(private streamService: StreamService) {}
  @Post('create')
  create(@Body() dto: StreamDto) {
    return this.streamService.create(dto);
  }
}
