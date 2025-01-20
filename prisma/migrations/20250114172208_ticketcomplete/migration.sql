-- AlterTable
ALTER TABLE `Procedure_item` MODIFY `ticket_type_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `caller_name` VARCHAR(191) NULL,
    ADD COLUMN `identity_document` INTEGER NULL,
    ADD COLUMN `isRecall` BOOLEAN NULL DEFAULT false,
    MODIFY `communication_type` VARCHAR(191) NULL DEFAULT 'chat';
