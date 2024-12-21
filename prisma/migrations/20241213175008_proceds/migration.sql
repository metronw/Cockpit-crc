/*
  Warnings:

  - You are about to drop the column `modal_media` on the `Procedure_item` table. All the data in the column will be lost.
  - You are about to alter the column `modal_body` on the `Procedure_item` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `Procedure_item` DROP COLUMN `modal_media`,
    MODIFY `modal_body` JSON NULL;

-- CreateTable
CREATE TABLE `Procedure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `ticket_type_id` INTEGER NOT NULL,
    `company_id` INTEGER NULL,
    `items` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
