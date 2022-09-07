import { JwtBearerAuthGuard } from './jwt-bearer-auth.guard';

describe('JwtBearerAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtBearerAuthGuard()).toBeDefined();
  });
});
