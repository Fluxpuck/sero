import { Message, Events, Client, Collection, TextChannel } from 'discord.js';
import { askClaude } from '../services/claude';
import { UserResolver } from '../utils/user-resolver';

// Store recent messages per channel for context analysis
const recentMessages = new Map<string, Message[]>();
const MAX_CONTEXT_MESSAGES = 10;
const CONTEXT_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Cooldown for auto-responses to prevent excessive intervention
const autoResponseCooldowns = new Map<string, number>();
const AUTO_RESPONSE_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

export const name = Events.MessageCreate;

export async function execute(message: Message) {
    const client = message.client as Client;

    try {
        // Skip messages from bots to prevent potential loops
        if (message.author.bot) return;

        // Skip forwarded messages
        if (message.webhookId) return;

        // Store message in context history
        storeMessageInContext(message);

        // Check if user is owner or has the specific role
        const accessRoles = process.env.ACCESS_ROLE_ID?.split(',') || [];
        const hasRole = accessRoles.some(roleId => message.member?.roles.cache.has(roleId));
        const isOwner = client.ownerId === message.author.id;

        // Check if the message contains the word "flux" (case insensitive)
        // and notify the owner if it does
        if (/\b[fF][lL][uU][xX]\w*\b/.test(message.content)) {
            if (!message.guild) return;

            const owner = await UserResolver.resolve(message.guild, `${client.ownerId}`);
            if (!isOwner && owner) {
                await owner.send(`⚠️ You've been [mentioned](${message.url}) by ${message.author.tag}`);
            }
        }

        // Check for direct invocation first (explicit requests)
        const mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);
        const isMention = mentionPrefix.test(message.content);
        const containsKeyword = /\b(hey sero|sero help|help sero)\b/i.test(message.content);
        const isReplyToBot = message.reference?.messageId &&
            (await message.channel.messages.fetch(message.reference.messageId))
                .author.id === client.user?.id;
        const isDirectMessage = message.channel.type === 1; // DM channel type is 1

        // Direct invocation handling - anyone can use direct invocations
        const isDirectInvocation = isMention || containsKeyword || isReplyToBot || isDirectMessage;

        if (isDirectInvocation) {
            // Extract query based on type of interaction
            let query = message.content;
            if (isMention) {
                query = message.content.replace(mentionPrefix, '').trim();
            } else if (containsKeyword) {
                // Remove the keyword trigger from the message
                query = message.content.replace(/\b(hey sero|sero help|sero,|help sero)\b/i, '').trim();
            }

            if (!query && (isMention || containsKeyword)) {
                await message.reply('Please provide a message for me to respond to.');
                return;
            }

            // Forward the query to Claude
            await askClaude(query, message);
            return;
        }

        // Only proceed with auto-response for authorized users
        if (!isOwner && !hasRole) return;

        // Check if we're on cooldown for this channel
        const channelCooldownKey = message.channelId;
        const now = Date.now();
        const cooldownExpiry = autoResponseCooldowns.get(channelCooldownKey);
        if (cooldownExpiry && now < cooldownExpiry) {
            return; // Still on cooldown
        }

        // Check if we should auto-respond based on context
        const shouldAutoRespond = await evaluateContextForAutoResponse(message);

        if (shouldAutoRespond) {
            // Set cooldown
            autoResponseCooldowns.set(channelCooldownKey, now + AUTO_RESPONSE_COOLDOWN_MS);

            // Get recent conversation context
            const contextMessages = getContextForChannel(message.channelId);
            const conversationContext = compileConversationContext(contextMessages);

            // Create contextual query for Claude to evaluate
            const prompt = `
I'm monitoring this conversation and I notice it might need my input:

${conversationContext}

Should I respond to help this conversation? If I should respond, provide assistance based on the conversation context. If I should not intervene, simply reply with "I don't need to intervene right now."
`;

            // Let Claude decide whether to respond
            await askClaude(prompt, message);
        }

    } catch (error) {
        console.error('Error in messageCreate:', error);
        await message.reply('Sorry, I encountered an error while processing your request. Please try again later.');
    }
}

/**
 * Stores a message in the context history for its channel
 */
function storeMessageInContext(message: Message): void {
    if (!message.content?.trim()) return; // Skip empty messages

    const channelId = message.channelId;
    if (!recentMessages.has(channelId)) {
        recentMessages.set(channelId, []);
    }

    const channelMessages = recentMessages.get(channelId)!;
    channelMessages.push(message);

    // Trim to keep only the most recent messages
    while (channelMessages.length > MAX_CONTEXT_MESSAGES) {
        channelMessages.shift();
    }

    // Clean up old messages periodically
    setTimeout(() => {
        if (recentMessages.has(channelId)) {
            const messages = recentMessages.get(channelId)!;
            const now = Date.now();
            const filtered = messages.filter(m => now - m.createdTimestamp < CONTEXT_EXPIRY_MS);
            if (filtered.length > 0) {
                recentMessages.set(channelId, filtered);
            } else {
                recentMessages.delete(channelId);
            }
        }
    }, CONTEXT_EXPIRY_MS);
}

/**
 * Gets the stored messages for a channel
 */
function getContextForChannel(channelId: string): Message[] {
    return recentMessages.get(channelId) || [];
}

/**
 * Compiles recent messages into a readable conversation format for Claude
 */
function compileConversationContext(messages: Message[]): string {
    return messages
        .map(m => `${m.author.username}: ${m.content}`)
        .join('\n');
}

/**
 * Analyzes the recent conversation to determine if Sero should automatically respond
 */
async function evaluateContextForAutoResponse(message: Message): Promise<boolean> {
    // Get recent messages for context
    const contextMessages = getContextForChannel(message.channelId);
    if (contextMessages.length < 3) return false; // Need at least 3 messages for context

    // Count unique users to determine if it's an active conversation
    const uniqueUsers = new Set(contextMessages.map(m => m.author.id));
    const isActiveConversation = uniqueUsers.size >= 2;
    if (!isActiveConversation) return false;

    // Check for potential rule violation indicators
    const ruleViolationPatterns = [
        // Toxic behavior patterns
        { pattern: /\b(fuck|shit|damn|bitch|ass|\*\*\*\*|wtf|stfu)\b/i, weight: 2 },
        { pattern: /\b(idiot|moron|stupid|dumb|retard)\b/i, weight: 2 },

        // Harassment/targeting patterns
        { pattern: /\b(hate|attack|harass|target|bully)\b/i, weight: 2 },

        // Spam patterns
        { pattern: /(.)\1{4,}/i, weight: 1 }, // Repeated characters
        { pattern: /(.).?\1.?\1.?\1.?\1/i, weight: 1 }, // Same message pattern

        // NSFW content indicators
        { pattern: /\b(nsfw|porn|sex|nude|naked|xxx)\b/i, weight: 3 },

        // Political/controversial topics
        { pattern: /\b(politic|trump|biden|democrat|republican|election|vote)\b/i, weight: 1 },

        // Advertising/self-promotion
        { pattern: /\b(subscribe|follow me|my channel|join my|discord\.gg|https?:\/\/)\b/i, weight: 2 },

        // Heated argument indicators
        { pattern: /\b(no you|you're wrong|shut up|not true|stop lying)\b/i, weight: 1 }
    ];

    // Calculate violation score based on recent messages
    let violationScore = 0;
    let potentialViolationType = '';
    const recentMessages = contextMessages.slice(-6);

    // Check for message frequency/spam
    const messagesByUser = new Map<string, { count: number, timestamps: number[] }>();

    for (const msg of recentMessages) {
        if (msg.author.bot) continue;

        // Track message frequency by user
        if (!messagesByUser.has(msg.author.id)) {
            messagesByUser.set(msg.author.id, { count: 0, timestamps: [] });
        }

        const userData = messagesByUser.get(msg.author.id)!;
        userData.count++;
        userData.timestamps.push(msg.createdTimestamp);

        // Check for rule violation indicators
        for (const indicator of ruleViolationPatterns) {
            if (indicator.pattern.test(msg.content)) {
                violationScore += indicator.weight;

                // Set the potential violation type based on the highest scoring pattern
                if (!potentialViolationType && indicator.weight > 1) {
                    if (indicator.pattern.source.includes("nsfw|porn")) {
                        potentialViolationType = 'NSFW content';
                    } else if (indicator.pattern.source.includes("fuck|shit")) {
                        potentialViolationType = 'Toxic language';
                    } else if (indicator.pattern.source.includes("hate|attack")) {
                        potentialViolationType = 'Harassment';
                    } else if (indicator.pattern.source.includes("subscribe|follow")) {
                        potentialViolationType = 'Self-promotion';
                    }
                }
            }
        }
    }

    // Check for rapid message spam (more than 5 messages in 10 seconds)
    for (const [userId, userData] of messagesByUser.entries()) {
        if (userData.count >= 4) {
            const timespan = Math.max(...userData.timestamps) - Math.min(...userData.timestamps);
            if (timespan < 10000 && userData.count >= 4) { // 10 seconds
                violationScore += 4;
                potentialViolationType = 'Message spam';
            }
        }
    }

    // Check for repeated identical messages
    const messageContents = recentMessages.map(m => m.content.toLowerCase());
    const uniqueContents = new Set(messageContents);
    if (messageContents.length >= 3 && uniqueContents.size <= messageContents.length / 2) {
        violationScore += 3;
        potentialViolationType = 'Content spam';
    }

    // Check for excessive mentions
    const hasManyMentions = recentMessages.some(msg =>
        (msg.content.match(/<@!?\d+>/g) || []).length > 3
    );
    if (hasManyMentions) {
        violationScore += 3;
        potentialViolationType = 'Mention spam';
    }

    // Update message prompt if there's a potential violation
    if (violationScore >= 5 && potentialViolationType) {
        return true;
    }

    return false;
}

