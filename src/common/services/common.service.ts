import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  constructor() {}

  //---------------HELPERS--------------------
  flattenDepartments<
    TDepartment extends Record<string, string>,
    TUser extends { departments: { department: TDepartment }[] },
    K extends keyof TDepartment,
  >(user: TUser, field: K): string[] {
    return user.departments.map((d) => d.department[field]);
  }
}
