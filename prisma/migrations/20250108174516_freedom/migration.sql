/*
  Warnings:

  - You are about to drop the column `label` on the `Procedure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Procedure` DROP COLUMN `label`;

-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `caller_number` VARCHAR(191) NULL,
    ADD COLUMN `communication_id` VARCHAR(191) NULL,
    ADD COLUMN `communication_type` VARCHAR(191) NULL,
    ADD COLUMN `trunk_name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `User_phone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sip_extension` VARCHAR(191) NOT NULL,
    `sip_server` VARCHAR(191) NOT NULL,
    `sip_password` VARCHAR(191) NOT NULL,
    `sip_port` INTEGER NOT NULL,
    `sip_websocket` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `auto_answer` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_phone_sip_extension_key`(`sip_extension`),
    UNIQUE INDEX `User_phone_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Queue` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `trunk_name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhonePrefix` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `trunk` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
