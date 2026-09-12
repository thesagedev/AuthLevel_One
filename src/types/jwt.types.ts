/**
 * JWT payload
 * 
 * Data stored inside an access token
 */

export interface AccessTokenPayload {
    sub: string;
    email: string;
}
