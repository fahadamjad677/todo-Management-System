export type assignToUser = {
  id: string;
  departments: {
    department: {
      id: string;
      name: string;
    };
  }[];
  role: {
    name: string;
  };
};
