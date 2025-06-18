import { AllExceptionsFilter } from './all-exceptions.filter';
import { LoggerService } from '../../logger/logger.service';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: LoggerService;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
    } as any;
    filter = new AllExceptionsFilter(logger);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException and log error', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({
      method: 'GET',
      url: '/test',
    });

    const mockSwitchToHttp = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    });

    const host = {
      switchToHttp: mockSwitchToHttp,
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(logger.error).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        path: '/test',
        message: expect.anything(),
      }),
    );
  });

  it('should handle unknown exception and log error', () => {
    const exception = new Error('Unknown error');

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({
      method: 'POST',
      url: '/unknown',
    });

    const mockSwitchToHttp = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    });

    const host = {
      switchToHttp: mockSwitchToHttp,
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(logger.error).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/unknown',
        message: exception,
      }),
    );
  });
});
