-- Migration script for moving message templates from JS files to database tables
-- Created: 2025-08-23

-- Template Messages Migration
-- This section migrates messages from various JS files to the template_messages table

-- Create ENUM type if it doesn't exist (may already be created by Sequelize)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_template_messages_type') THEN
        CREATE TYPE enum_template_messages_type AS ENUM (
            'welcome', 'birthday', 'job', 'levelup', 'reward-drop', 'claim-reward', 'treasure'
        );
    END IF;
END$$;

-- Ensure the template_messages table exists
CREATE TABLE IF NOT EXISTS template_messages (
    id SERIAL PRIMARY KEY,
    "guildId" VARCHAR(255),
    type enum_template_messages_type NOT NULL,
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP WITH TIME ZONE
    -- Remove the UNIQUE constraint here, we'll create a conditional index below
);

-- Alter table to allow NULL guildId if it already exists
ALTER TABLE template_messages ALTER COLUMN "guildId" DROP NOT NULL;

-- Create index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'template_messages' 
        AND indexname = 'template_messages_guild_type_idx'
    ) THEN
        CREATE UNIQUE INDEX template_messages_guild_type_idx ON template_messages ("guildId", type) WHERE "guildId" IS NOT NULL;
    END IF;
END$$;

-- Insert default welcome messages (no guild ID for default templates)
-- First, let's delete any existing welcome templates with NULL guildId to avoid conflicts
DELETE FROM template_messages WHERE "guildId" IS NULL AND type = 'welcome';

-- Now insert the welcome templates
INSERT INTO template_messages ("guildId", type, message, "createdAt", "updatedAt")
VALUES
(NULL, 'welcome', '{name}! We are happy to have you here!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Hello {name}, glad to see you!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'We are delighted to have you among us {name}.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'We are thrilled to have {name} here.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'We hope you''ll have an amazing time here {name}!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Hope you''ll enjoy it here {name}!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'We are very excited to have you, {name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'You hit the join button and joined {name}!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Want a cup of tea? We got coffee too!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Hey {name}, hope you brought some pizza!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', '{name}, we have been waiting for you!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'We are so excited, {name} finally joined the server!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'We smile and wave to you {name}, glad to see you!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Salute {name}, enjoy your time here!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Hi {name}, we''re happy to see you in here!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'WOW! It''s {name}, glad to see you!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', '{name} has finally arrived!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Good to see you, {name}!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Pssst, the cool kid has arrived. It''s {name}!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Hey you... Yeah you, {name}. Glad to see you!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Hey {name}, we have been expecting you!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'May the Force be with you, {name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'A wild {name} appeared in the server.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Yer on Discord, ~~Harry~~ {name}.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'My precious, {name}.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'Look who decided to show up, {name}!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'welcome', 'This is the server you''re looking for, {name}.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default birthday messages
-- First, let's delete any existing birthday templates with NULL guildId to avoid conflicts
DELETE FROM template_messages WHERE "guildId" IS NULL AND type = 'birthday';

-- Now insert the birthday templates
INSERT INTO template_messages ("guildId", type, message, "createdAt", "updatedAt")
VALUES
(NULL, 'birthday', 'Happy birthday, {NAME}! Have fun! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Enjoy your day, {NAME}! 🎂', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'It''s your day, {NAME}! Celebrate big! 🎈', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Happy birthday, {NAME}! Party time! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Best wishes, {NAME}! Have a great day! 🎁', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Cheers, {NAME}! Happy birthday! 🍰', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Smile bright, {NAME}! Happy birthday! 😊', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Enjoy, {NAME}! Happy birthday! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Happy birthday, {NAME}! Adventure time! 🎈', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Happy {AGE}th, {NAME}! Enjoy! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Congrats on {AGE}, {NAME}! 🎂', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', '{NAME}, you rock at {AGE}! Happy birthday! 🎈', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Happy birthday, {NAME}, you cool {AGE}-year-old! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', '{AGE} cheers, {NAME}! Have fun! 🎁', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Awesome {AGE}th, {NAME}! Enjoy! 🍰', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Happy Birthday, {NAME}! Have {AGE} times the fun! 😊', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', '{NAME}, {AGE} is just the start! Happy birthday! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', '{NAME}, {AGE} wishes come true! Happy birthday! 🎈', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'birthday', 'Happy birthday, {NAME}! {AGE} looks great on you! 🎁', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default levelup messages
-- First, let's delete any existing levelup templates with NULL guildId to avoid conflicts
DELETE FROM template_messages WHERE "guildId" IS NULL AND type = 'levelup';

-- Now insert the levelup templates
INSERT INTO template_messages ("guildId", type, message, "createdAt", "updatedAt")
VALUES
(NULL, 'levelup', 'Your journey to greatness continues! {AUTHOR} has leveled up to **level {LEVEL}**! 🎉', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', 'Congratulations! {AUTHOR} has just unlocked a new level of awesomeness at **level {LEVEL}**! 🌟', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', 'Level up! {AUTHOR}''s typing-skills is reaching new heights at **level {LEVEL}**! 🚀', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', '{AUTHOR}''s fast fingers helped them reach **level {LEVEL}**! 👈', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', 'You''ve made your presence known! {AUTHOR} has reached **level {LEVEL}**! ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', 'Level up! {AUTHOR}''s typing-skills is reaching legendary status at **level {LEVEL}**! 🏆', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', '{AUTHOR} has reached **level {LEVEL}**! The sky''s the limit! 🌌', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', '{AUTHOR} has reached **level {LEVEL}**. Keep up the amazing work! 💪', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', '{AUTHOR} has just leveled up to **level {LEVEL}**! The adventure only gets more exciting from here! 🗺️', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(NULL, 'levelup', 'Level up achieved! {AUTHOR}''s dedication is paying off at **level {LEVEL}**! 🏆', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Prereason Messages Migration
-- This section migrates moderation reason messages to the prereason_messages table

-- Create ENUM type if it doesn't exist (may already be created by Sequelize)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_prereason_messages_type') THEN
        CREATE TYPE enum_prereason_messages_type AS ENUM (
            'ban', 'kick', 'mute', 'unban', 'unmute'
        );
    END IF;
END$$;

-- Ensure the prereason_messages table exists
CREATE TABLE IF NOT EXISTS prereason_messages (
    id SERIAL PRIMARY KEY,
    type enum_prereason_messages_type NOT NULL,
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- Create index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'prereason_messages' 
        AND indexname = 'prereason_messages_id_idx'
    ) THEN
        CREATE UNIQUE INDEX prereason_messages_id_idx ON prereason_messages (id);
    END IF;
END$$;

-- Insert ban reason messages
-- First, let's delete any existing ban reason messages to avoid conflicts
DELETE FROM prereason_messages WHERE type = 'ban';

-- Now insert the ban reason messages
INSERT INTO prereason_messages (type, message, "createdAt", "updatedAt")
VALUES
('ban', 'Impersonating a staff member or another user.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Having an innapropriate username.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Using an alt account.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Multiple server rule infringements.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Saying racial slurs in chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Violating Discord Terms of Service.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Posting NSFW content.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ban', 'Being under the age of 12, violating Discord ToS.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert kick reason messages
-- First, let's delete any existing kick reason messages to avoid conflicts
DELETE FROM prereason_messages WHERE type = 'kick';

-- Now insert the kick reason messages
INSERT INTO prereason_messages (type, message, "createdAt", "updatedAt")
VALUES
('kick', 'Impersonating a staff member or another user.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Having an innapropriate username.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Using an alt account.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Multiple server rule infringements.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Saying racial slurs in chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Violating Discord Terms of Service.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Posting NSFW content.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kick', 'Being under the age of 12, violating Discord ToS.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert mute reason messages
-- First, let's delete any existing mute reason messages to avoid conflicts
DELETE FROM prereason_messages WHERE type = 'mute';

-- Now insert the mute reason messages
INSERT INTO prereason_messages (type, message, "createdAt", "updatedAt")
VALUES
('mute', 'Spamming excessively in a chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Cursing excessively in a chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Bullying another member.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Speaking in a foreign language.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Mini-modding.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Creating drama in the chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Using special characters excessively in a chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Typing in all caps excessively in a chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Advertising a server or website.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mute', 'Talking about inappropriate things in a chat.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Note: Job messages are not included in this migration as they would require
-- a different table structure than what's provided in the model files.
-- Consider creating a separate job_messages table if needed.

-- Add comments to explain the migration
COMMENT ON TABLE template_messages IS 'Stores message templates for various bot interactions';
COMMENT ON TABLE prereason_messages IS 'Stores predefined moderation reason messages';
