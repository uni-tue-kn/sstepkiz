import { JwtQueryAuthGuard } from './jwt-query-auth.guard';

describe('JwtQueryAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtQueryAuthGuard()).toBeDefined();
  });
});
