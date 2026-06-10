/*
  Warnings:

  - Added the required column `createdbyId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "createdbyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdbyId_fkey" FOREIGN KEY ("createdbyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
