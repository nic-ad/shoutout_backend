import { passportJwtSecret } from 'jwks-rsa';
import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { DEFAULT_JWT, RESTRICTED_JWT } from './constants';

export const DefaultJwtStrategy = {
  provide: 'DefaultJwtStrategy',
  useFactory: () =>
    jwtStategy({
      audience: process.env.AUTH0_AUDIENCE,
      name: DEFAULT_JWT,
    }),
};

export const RestrictedJwtStrategy = {
  provide: 'RestrictedJwtStrategy',
  useFactory: () =>
    jwtStategy({
      audience: process.env.AUTH0_RESTRICTED_AUDIENCE,
      name: RESTRICTED_JWT,
    }),
};

function jwtStategy(strategyConfig: any) {
  return passport.use(
    strategyConfig.name,
    new Strategy(
      {
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
        }),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        issuer: process.env.AUTH0_ISSUER_URL,
        algorithms: ['RS256'],
        audience: strategyConfig.audience,
      },
      (payload: unknown, done: any): unknown => done(null, payload),
    ),
  );
}
