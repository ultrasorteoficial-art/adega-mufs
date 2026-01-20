CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileSize` int NOT NULL,
	`description` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skus` ADD CONSTRAINT `skus_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `client_code_idx` ON `clients` (`code`);--> statement-breakpoint
CREATE INDEX `client_name_idx` ON `clients` (`name`);--> statement-breakpoint
CREATE INDEX `evidence_client_idx` ON `evidence` (`clientId`);--> statement-breakpoint
CREATE INDEX `evidence_uploaded_at_idx` ON `evidence` (`uploadedAt`);--> statement-breakpoint
CREATE INDEX `sku_client_idx` ON `skus` (`clientId`);--> statement-breakpoint
CREATE INDEX `sku_code_idx` ON `skus` (`code`);