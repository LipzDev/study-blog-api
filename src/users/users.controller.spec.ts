describe('getScheduledTasksStatus', () => {
  it('should return scheduled tasks status for SUPER_ADMIN', async () => {
    const mockUser = {
      id: '1',
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
    };

    const mockRequest = {
      user: mockUser,
    };

    const result = await controller.getScheduledTasksStatus(mockRequest);

    expect(result).toEqual({
      cleanupUnverifiedUsers: {
        schedule: '0 0 * * *',
        timeZone: 'America/Sao_Paulo',
        description:
          'Limpeza automática de usuários não verificados (diariamente à meia-noite)',
      },
      cleanupExpiredResetTokens: {
        schedule: '0 */6 * * *',
        timeZone: 'America/Sao_Paulo',
        description:
          'Limpeza de tokens de redefinição expirados (a cada 6 horas)',
      },
      systemStatusLog: {
        schedule: '0 * * * *',
        timeZone: 'America/Sao_Paulo',
        description: 'Log de status do sistema (a cada hora)',
      },
    });
  });

  it('should throw ForbiddenException for non-SUPER_ADMIN users', async () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      role: UserRole.USER,
    };

    const mockRequest = {
      user: mockUser,
    };

    await expect(
      controller.getScheduledTasksStatus(mockRequest),
    ).rejects.toThrow(ForbiddenException);
  });
});
