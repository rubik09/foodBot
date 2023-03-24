import { Catch, ExceptionFilter } from '@nestjs/common';
import { logger, errors } from '@1win/cdp-backend-tools';
import config from './configuration/config';
const exceptionFilter = errors.exceptionFilter;
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = logger.createLogger(config());
  catch(exceptions) {
    // choose handleExceptionForTcp or handleExceptionForHttp here in terms of which transport is main for end user of service
    return exceptionFilter.catchHelper(exceptions, exceptionFilter.handleExceptionForTcp, this.logger);
  }
}
