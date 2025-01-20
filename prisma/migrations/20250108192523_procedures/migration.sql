/*
  Warnings:

  - You are about to drop the `Procedure` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Procedure`;

-- CreateTable
CREATE TABLE `Procedures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_type_id` INTEGER NOT NULL,
    `company_id` INTEGER NULL,
    `items` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
