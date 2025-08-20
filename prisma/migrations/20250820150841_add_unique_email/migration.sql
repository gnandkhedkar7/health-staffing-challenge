/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `TransformedUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TransformedUser_email_key" ON "TransformedUser"("email");
