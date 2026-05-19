CREATE TABLE `chamber_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`chamberName` varchar(64) NOT NULL,
	`stateData` text NOT NULL,
	`coherenceScore` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chamber_states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `query_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`query` text NOT NULL,
	`emotionalValence` varchar(10) DEFAULT '0',
	`urgency` varchar(10) DEFAULT '0.5',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `query_sessions_id` PRIMARY KEY(`id`)
);
