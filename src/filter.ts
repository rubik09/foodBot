import { Catch, ExceptionFilter } from '@nestjs/common';
import { logger, errors } from '@1win/cdp-backend-tools';
import config from './configuration/config';
const exceptionFilter = errors.exceptionFilter;
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = logger.createLogger(config());
  catch(exceptions: any) {
    return exceptionFilter.catchHelper(exceptions, exceptionFilter.handleExceptionForRmq, this.logger);
  }
}
