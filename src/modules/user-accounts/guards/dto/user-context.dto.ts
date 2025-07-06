//what will be in user in request

export class UserContextDto {
  id: number;
}

export class UserRefreshContextDto {
  id: number;
  deviceId: string;
  iat: number;
  exp: number;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };
