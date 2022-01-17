/**
 * JWT payload data transfer object
 */
export class JwtPayloadDto {
  subject: string;
  isTwoFAAuthenticated?: boolean;
}
