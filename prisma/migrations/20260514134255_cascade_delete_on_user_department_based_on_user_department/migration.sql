-- DropForeignKey
ALTER TABLE "UserDepartment" DROP CONSTRAINT "UserDepartment_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "UserDepartment" DROP CONSTRAINT "UserDepartment_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserDepartment" ADD CONSTRAINT "UserDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDepartment" ADD CONSTRAINT "UserDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
