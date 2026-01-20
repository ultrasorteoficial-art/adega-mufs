CREATE TABLE `competitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitors_id` PRIMARY KEY(`id`),
	CONSTRAINT `competitors_name_unique` UNIQUE(`name`),
	CONSTRAINT `competitors_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`competitorId` int NOT NULL,
	`previousValue` decimal(10,2),
	`newValue` decimal(10,2) NOT NULL,
	`changedBy` int NOT NULL,
	`changeType` enum('created','updated','deleted') NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`competitorId` int NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`registeredBy` int NOT NULL,
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `priceHistory` ADD CONSTRAINT `priceHistory_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceHistory` ADD CONSTRAINT `priceHistory_competitorId_competitors_id_fk` FOREIGN KEY (`competitorId`) REFERENCES `competitors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceHistory` ADD CONSTRAINT `priceHistory_changedBy_users_id_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prices` ADD CONSTRAINT `prices_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prices` ADD CONSTRAINT `prices_competitorId_competitors_id_fk` FOREIGN KEY (`competitorId`) REFERENCES `competitors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prices` ADD CONSTRAINT `prices_registeredBy_users_id_fk` FOREIGN KEY (`registeredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `history_product_idx` ON `priceHistory` (`productId`);--> statement-breakpoint
CREATE INDEX `history_competitor_idx` ON `priceHistory` (`competitorId`);--> statement-breakpoint
CREATE INDEX `history_changed_at_idx` ON `priceHistory` (`changedAt`);--> statement-breakpoint
CREATE INDEX `product_competitor_idx` ON `prices` (`productId`,`competitorId`);--> statement-breakpoint
CREATE INDEX `price_product_idx` ON `prices` (`productId`);--> statement-breakpoint
CREATE INDEX `price_competitor_idx` ON `prices` (`competitorId`);--> statement-breakpoint
CREATE INDEX `product_name_idx` ON `products` (`name`);--> statement-breakpoint
CREATE INDEX `product_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);