import { mockDbClient } from '@/db/__test-utils__/mock-db-client';
import { envConfig } from '@/env';
import { mockSession } from '@/middlewares/__test-utils__/openapi-hono';
import { UnauthorizedError } from '@/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshSessionAuthService } from './refresh-session';

const mockDependencies = {
  getSessionData: vi.fn(),
  revokeSessionData: vi.fn(),
  updateSessionData: vi.fn(),
  getUserData: vi.fn(),
  verifyJWT: vi.fn(),
  generateJWT: vi.fn(),
  decodeJWT: vi.fn(),
};

const mockRefreshTokenPayload = {
  email: 'test@example.com',
  accountId: mockSession.accountId,
  sub: 'user123',
  iss: 'refresh',
  aud: 'frontend',
};

const mockSessionData = {
  id: 'session123',
  refresh_token: 'refreshToken123',
  account_id: mockSession.accountId,
};

const mockUser = {
  id: mockSession.accountId,
  email: 'test@example.com',
};

describe('refreshSessionAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully refresh the session', async () => {
    const payload = {
      session: mockSession,
      refreshToken: 'refreshToken123',
    };

    mockDependencies.decodeJWT.mockReturnValue(mockRefreshTokenPayload);
    mockDependencies.verifyJWT.mockReturnValue(true);
    mockDependencies.getSessionData.mockResolvedValue(mockSessionData);
    mockDependencies.generateJWT.mockReturnValueOnce('newRefreshToken');
    mockDependencies.updateSessionData.mockResolvedValue({
      ...mockSessionData,
      refresh_token: 'newRefreshToken',
    });
    mockDependencies.getUserData.mockResolvedValue(mockUser);
    mockDependencies.generateJWT.mockReturnValueOnce('newAccessToken');

    const result = await refreshSessionAuthService({
      dbClient: mockDbClient.dbClientTransaction,
      payload,
      dependencies: mockDependencies,
    });

    expect(result).toEqual({
      user: mockUser,
      sessionId: mockSessionData.id,
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    });

    expect(mockDependencies.decodeJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
    });

    expect(mockDependencies.verifyJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
      secretOrPublicKey: envConfig.JWT_REFRESH_TOKEN_SECRET,
    });

    expect(mockDependencies.getSessionData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      accountId: mockRefreshTokenPayload.accountId,
    });

    expect(mockDependencies.generateJWT).toHaveBeenNthCalledWith(1, {
      payload: {
        accountId: mockRefreshTokenPayload.accountId,
        sub: mockRefreshTokenPayload.sub,
        iss: 'refresh',
        aud: 'frontend',
      },
      secretOrPrivateKey: envConfig.JWT_REFRESH_TOKEN_SECRET,
      signOptions: { expiresIn: '30d' },
    });

    expect(mockDependencies.updateSessionData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockSessionData.id,
      values: { refresh_token: 'newRefreshToken' },
    });

    expect(mockDependencies.getUserData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      id: mockRefreshTokenPayload.accountId,
    });

    expect(mockDependencies.generateJWT).toHaveBeenNthCalledWith(2, {
      payload: {
        email: mockUser.email,
        accountId: mockUser.id,
        sessionId: mockSessionData.id,
        sub: mockUser.id,
        iss: 'refresh',
        aud: 'frontend',
      },
      secretOrPrivateKey: envConfig.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '5m' },
    });
  });

  it('should throw UnauthorizedError when refresh token cannot be decoded', async () => {
    const payload = {
      session: mockSession,
      refreshToken: 'invalidToken',
    };

    mockDependencies.decodeJWT.mockReturnValue(null);

    await expect(
      refreshSessionAuthService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new UnauthorizedError('Refresh token is invalid.'));

    expect(mockDependencies.decodeJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
    });
  });

  it('should throw UnauthorizedError when refresh token fails verification', async () => {
    const payload = {
      session: mockSession,
      refreshToken: 'expiredRefreshToken',
    };

    mockDependencies.decodeJWT.mockReturnValue(mockRefreshTokenPayload);
    mockDependencies.verifyJWT.mockImplementation(() => {
      throw new Error('Token expired');
    });

    await expect(
      refreshSessionAuthService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow();

    expect(mockDependencies.decodeJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
    });
    expect(mockDependencies.verifyJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
      secretOrPublicKey: envConfig.JWT_REFRESH_TOKEN_SECRET,
    });
  });

  it('should throw UnauthorizedError when refresh token does not match session', async () => {
    const payload = {
      session: { ...mockSession, accountId: 'differentAccountId' },
      refreshToken: 'refreshToken123',
    };

    mockDependencies.decodeJWT.mockReturnValue(mockRefreshTokenPayload);
    mockDependencies.verifyJWT.mockReturnValue(true);
    mockDependencies.getSessionData.mockResolvedValue(mockSessionData);

    await expect(
      refreshSessionAuthService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new UnauthorizedError('Refresh token does not match session.'));

    expect(mockDependencies.decodeJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
    });
    expect(mockDependencies.verifyJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
      secretOrPublicKey: envConfig.JWT_REFRESH_TOKEN_SECRET,
    });
    expect(mockDependencies.getSessionData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      accountId: mockRefreshTokenPayload.accountId,
    });
  });

  it('should throw UnauthorizedError when refresh token is invalid', async () => {
    const payload = {
      session: mockSession,
      refreshToken: 'invalidToken',
    };

    mockDependencies.decodeJWT.mockReturnValue(mockRefreshTokenPayload);
    mockDependencies.verifyJWT.mockReturnValue(true);
    mockDependencies.getSessionData.mockResolvedValue(mockSessionData);

    await expect(
      refreshSessionAuthService({
        dbClient: mockDbClient.dbClientTransaction,
        payload,
        dependencies: mockDependencies,
      })
    ).rejects.toThrow(new UnauthorizedError('Refresh token is invalid.'));

    expect(mockDependencies.decodeJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
    });
    expect(mockDependencies.verifyJWT).toHaveBeenCalledWith({
      token: payload.refreshToken,
      secretOrPublicKey: envConfig.JWT_REFRESH_TOKEN_SECRET,
    });
    expect(mockDependencies.getSessionData).toHaveBeenCalledWith({
      dbClient: mockDbClient.dbClient,
      accountId: mockRefreshTokenPayload.accountId,
    });
  });
});
