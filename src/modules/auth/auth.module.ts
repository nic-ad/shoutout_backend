import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { DEFAULT_JWT, RESTRICTED_JWT } from './constants';
import { DefaultJwtStrategy, RestrictedJwtStrategy } from './strategies';

@Module({
  imports: [PassportModule.register({ defaultStrategy: [DEFAULT_JWT, RESTRICTED_JWT] })],
  providers: [DefaultJwtStrategy, RestrictedJwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
