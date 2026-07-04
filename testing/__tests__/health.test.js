jest.mock('../../backend/config/db.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import getPool from '../../backend/config/db.js';
import { healthHandler, readinessHandler } from '../../backend/controllers/health.controller.js';

const createResponse = () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };

  return res;
};

describe('Health Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a healthy status without checking dependencies', () => {
    const res = createResponse();

    healthHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        service: 'pokemon-backend',
      })
    );
  });

  it('returns ready when the database responds', async () => {
    getPool.mockReturnValue({
      query: jest.fn().mockResolvedValue([[{ value: 1 }]]),
    });
    const res = createResponse();

    await readinessHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ready',
        dependencies: { database: 'ok' },
      })
    );
  });

  it('returns not ready when the database is unavailable', async () => {
    getPool.mockReturnValue({
      query: jest.fn().mockRejectedValue(new Error('database down')),
    });
    const res = createResponse();

    await readinessHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'not_ready',
        dependencies: { database: 'unavailable' },
      })
    );
  });
});
