export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  memberId: number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
};

export type SignUpRequest = {
  email: string;
  password: string;
  name: string;
};

export type SignUpResponseData = LoginResponseData;

export type ReissueRequest = {
  refreshToken: string;
};

export type ReissueResponseData = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
};

