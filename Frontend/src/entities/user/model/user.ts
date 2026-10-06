export enum EUserRole {
  USER = 'USER',
  DEPENDENT = 'DEPENDENT',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: EUserRole;
}
