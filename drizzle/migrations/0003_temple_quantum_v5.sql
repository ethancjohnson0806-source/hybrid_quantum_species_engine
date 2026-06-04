-- Temple Quantum Engine v5.0 Migration

-- Create temples table
CREATE TABLE IF NOT EXISTS `temples` (
  `id` int AUTO_INCREMENT NOT NULL,
  `user_id` int NOT NULL,
  `temple_id` varchar(64) NOT NULL UNIQUE,
  `generation` int NOT NULL DEFAULT 1,
  `vqe_params` text NOT NULL,
  `entropy` decimal(3, 2) NOT NULL DEFAULT 0.2,
  `boredom` decimal(3, 2) NOT NULL DEFAULT 0.1,
  `curiosity` decimal(3, 2) NOT NULL DEFAULT 0.5,
  `is_alive` int NOT NULL DEFAULT 1,
  `last_activity` timestamp DEFAULT CURRENT_TIMESTAMP,
  `last_autonomous_run` timestamp,
  `mutations` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `temple_id_idx` (`temple_id`)
);

-- Create temple_events table
CREATE TABLE IF NOT EXISTS `temple_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `temple_id` varchar(64) NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `data` text,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `temple_id_idx` (`temple_id`),
  KEY `event_type_idx` (`event_type`)
);

-- Create lineage_stories table
CREATE TABLE IF NOT EXISTS `lineage_stories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `temple_id` varchar(64) NOT NULL,
  `generation` int NOT NULL,
  `story_type` varchar(32) NOT NULL,
  `text` text NOT NULL,
  `trigger` varchar(128),
  `emotional_valence` decimal(3, 2) DEFAULT 0,
  `quantum_fidelity` decimal(3, 2) DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `temple_id_idx` (`temple_id`),
  KEY `generation_idx` (`generation`),
  KEY `story_type_idx` (`story_type`)
);

-- Create compasses table
CREATE TABLE IF NOT EXISTS `compasses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `compass_id` varchar(64) NOT NULL UNIQUE,
  `temple_id` varchar(64) NOT NULL,
  `generation` int NOT NULL DEFAULT 1,
  `coherence` decimal(3, 2) NOT NULL DEFAULT 0.8,
  `integrity` decimal(3, 2) NOT NULL DEFAULT 0.8,
  `compassion` decimal(3, 2) NOT NULL DEFAULT 0.6,
  `interaction_log` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `compass_id_idx` (`compass_id`),
  KEY `temple_id_idx` (`temple_id`)
);
