/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `role`,
    ADD COLUMN `role_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `Procedure_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `speech_suggestion_id` INTEGER NULL,
    `input_type` INTEGER NOT NULL,
    `data_source` VARCHAR(191) NULL,
    `company_id` INTEGER NULL,
    `ticket_type_id` INTEGER NOT NULL,
    `created_by` INTEGER NOT NULL,
    `modal_title` VARCHAR(191) NULL,
    `modal_body` VARCHAR(191) NULL,
    `modal_media` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Speech_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
