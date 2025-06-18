import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { AllExceptionsFilter } from './filters/all-exceptions/all-exceptions.filter';

@Global()
@Module({
  providers: [LoggerService, AllExceptionsFilter],
  exports: [LoggerService, AllExceptionsFilter],
})
export class CoreModule {}
