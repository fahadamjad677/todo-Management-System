export type reportedUser = {
  name: string;
  id: string;
  departments: {
    department: {
      name: string;
      id: string;
    };
  }[];
  role: {
    name: string;
  };
};
