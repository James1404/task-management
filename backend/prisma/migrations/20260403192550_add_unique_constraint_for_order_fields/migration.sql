/*
  Warnings:

  - A unique constraint covering the columns `[projectId,order]` on the table `Column` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[columnId,order]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Column_projectId_order_key" ON "Column"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Task_columnId_order_key" ON "Task"("columnId", "order");
