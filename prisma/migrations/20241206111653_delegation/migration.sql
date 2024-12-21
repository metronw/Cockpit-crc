-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL,
    `threshold_1` INTEGER NULL,
    `threshold_2` INTEGER NULL,
    `fantasy_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_assign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `queue_type` INTEGER NULL,

    UNIQUE INDEX `User_assign_company_id_user_id_queue_type_key`(`company_id`, `user_id`, `queue_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User_assign` ADD CONSTRAINT `User_assign_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
