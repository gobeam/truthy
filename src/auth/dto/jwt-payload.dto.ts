/**
 * JWT payload data transfer object
 */
export class JwtPayloadDto {
  sub: string;
  isTwoFAAuthenticated?: boolean;
}
