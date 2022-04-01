export interface LoginResponse {
  idToken: string,
  refreshToken: string,
  accessToken: string,
  expiresIn: number,
  tokenType: string,
  refreshAfter: number
}