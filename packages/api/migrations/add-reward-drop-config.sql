-- Migration to add reward drop configuration to guild settings

INSERT INTO guild_settings ("guildId", type, "targetId", "excludeIds", "createdAt", "updatedAt")
VALUES 
('660103319557111808', 
'exp-reward-drop-channel', 
'660104519031717896', 
NULL, 
NOW(), 
NOW());