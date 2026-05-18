import { Injectable } from '@nestjs/common';
import { UserType } from 'src/common/types';

@Injectable()
export class CommonService {
  constructor() {}

  //---------------HELPERS--------------------
  flattenDepartments<T extends 'name' | 'id'>(
    user: UserType,
    field: T,
  ): string[] {
    return user.departments.map((d) => d.department[field]);
  }
}
