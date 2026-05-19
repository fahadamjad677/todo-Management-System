type Department = {
  id: string;
  name: string;
};

type UserDepartment = {
  department: Department;
};

export type UserType = {
  departments: UserDepartment[];
};

export type UserTypeExtended = {
  id: string;
  role: {
    name: string;
  };
  departments: UserDepartment[];
};
