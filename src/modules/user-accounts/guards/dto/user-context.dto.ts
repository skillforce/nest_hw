//what will be in user in request

export class UserContextDto {
  id: string;
}

export class UserRefreshContextDto {
  id: string;
  deviceId: string;
  iat: number;
  exp: number;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };
