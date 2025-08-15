import { Profile } from "src/profile/profile.model";

export class User {
  id: number;
  email: string;
  username: string;
  profile?: Profile | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: any): User {
    const { password, ...safeData } = entity;
    return new User(safeData);
  }
  static fromEntities(entities: any[]): User[] {
    if (!entities) return [];
    return entities.map(e => User.fromEntity(e));
  }
}