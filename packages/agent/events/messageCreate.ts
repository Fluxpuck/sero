import { Message, Events, Client } from 'discord.js';
import { askClaude } from '../services/claude';
import { UserResolver } from '../utils/user-resolver';
import NodeCache from 'node-cache';

// Replace Maps with NodeCache instances for automatic TTL handling
const recentMessagesCache = new NodeCache({
    stdTTL: 600, // 10 minutes in seconds
    checkperiod: 60, // Check for expired keys every minute
    useClones: false // Store references for better performance
});

// Cooldown cache with shorter TTL
const autoResponseCooldownCache = new NodeCache({
    stdTTL: 180, // 3 minutes in seconds
    checkperiod: 30, // Check for expired keys every 30 seconds
});

const MAX_CONTEXT_MESSAGES = 10;

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

        // Process autonomous moderation for all messages
        // Check if we're on cooldown for this channel
        const channelCooldownKey = message.channelId;

        // With NodeCache, we just check if the key exists - if not, the cooldown has expired
        const isOnCooldown = autoResponseCooldownCache.has(channelCooldownKey);

        // Always check for rule violations, but only proceed with moderation actions
        // if not on cooldown and user is not exempt from moderation
        const { shouldModerate, ruleViolation, violationSeverity } = await evaluateContextForModeration(message);

        // For moderators and owners, we still check but don't enforce automatically
        if (shouldModerate && (!isOwner && !hasRole)) {
            if (!isOnCooldown) {
                // Set cooldown (NodeCache handles TTL automatically)
                autoResponseCooldownCache.set(channelCooldownKey, true);

                // Get recent conversation context
                const contextMessages = getContextForChannel(message.channelId);
                const conversationContext = compileConversationContext(contextMessages);

                // Create contextual query for Claude to evaluate with moderation focus
                const prompt = `
I'm Sero, the autonomous moderator of this Discord server. I've detected a potential rule violation:

Rule violation category: ${ruleViolation}
Severity: ${violationSeverity}/10

Recent conversation:
${conversationContext}

As the server's moderation bot, I need to enforce the server rules. I should:
1. Identify which specific rule is being violated
2. Explain the rule violation clearly and professionally
3. Remind users of the appropriate behavior
4. Take moderation action if necessary (for severe violations)

I'll respond now as Sero the moderation bot to address this situation.
`;

                // Let Claude decide how to respond and potentially use moderation tools
                await askClaude(prompt, message);
            }
        }

    } catch (error) {
        console.error('Error in messageCreate:', error);
        // Don't send error messages for autonomous functions to avoid confusion
    }
}

/**
 * Stores a message in the context history for its channel using NodeCache
 */
function storeMessageInContext(message: Message): void {
    if (!message.content?.trim()) return; // Skip empty messages

    const channelId = message.channelId;

    // Get existing messages or create new array
    const channelMessages: Message[] = recentMessagesCache.get(channelId) || [];

    // Add new message
    channelMessages.push(message);

    // Trim to keep only the most recent messages
    while (channelMessages.length > MAX_CONTEXT_MESSAGES) {
        channelMessages.shift();
    }

    // Store updated array back in cache
    // TTL is handled by NodeCache configuration
    recentMessagesCache.set(channelId, channelMessages);
}

/**
 * Gets the stored messages for a channel from NodeCache
 */
function getContextForChannel(channelId: string): Message[] {
    return recentMessagesCache.get(channelId) || [];
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
 * Analyzes the recent conversation to determine if Sero should perform moderation actions
 * Returns both the decision and the detected rule violation information
 */
async function evaluateContextForModeration(message: Message): Promise<{
    shouldModerate: boolean;
    ruleViolation: string;
    violationSeverity: number;
}> {
    // Get recent messages for context
    const contextMessages = getContextForChannel(message.channelId);
    if (contextMessages.length < 2) {
        return { shouldModerate: false, ruleViolation: '', violationSeverity: 0 };
    }

    // Count unique users to determine if it's an active conversation
    const uniqueUsers = new Set(contextMessages.map(m => m.author.id));

    // Rule violation patterns aligned with SSundee's Community Rules
    const ruleViolationPatterns = [
        // Communication rules
        { pattern: /\b(fuck|shit|damn|bitch|ass|\*\*\*\*|wtf|stfu|dick|pussy)\b/i, weight: 4, category: "Cursing/Profanity" },
        { pattern: /(.)\1{5,}/i, weight: 2, category: "Spam" }, // Repeated characters
        { pattern: /(.).?\1.?\1.?\1.?\1/i, weight: 2, category: "Spam" }, // Spam patterns
        { pattern: /\b(أ|ب|ت|ث|ج|ح|خ|د|ذ|ر|ز|س|ش|ص|ض|ط|ظ|ع|غ|ف|ق|ك|ل|م|ن|ه|و|ي|а|б|в|г|д|е|ё|ж|з|и|й|к|л|м|н|о|п|р|с|т|у|ф|х|ц|ч|ш|щ|ъ|ы|ь|э|ю|я)\b/i, weight: 3, category: "Non-English Communication" },

        // Toxicity & Respect violations
        { pattern: /\b(idiot|moron|stupid|dumb|retard)\b/i, weight: 3, category: "Toxicity/Disrespect" },
        { pattern: /\b(hate|attack|harass|target|bully)\b/i, weight: 4, category: "Harassment" },
        { pattern: /\b(gay|lesbian|bi|trans|queer|lgbt)\b/i, weight: 5, category: "Sexual Orientation Discussion" },

        // NSFW content violations
        { pattern: /\b(nsfw|porn|sex|nude|naked|xxx)\b/i, weight: 7, category: "NSFW Content" },

        // Self-promotion violations
        { pattern: /\b(subscribe|follow me|my channel|join my|discord\.gg|https?:\/\/)\b/i, weight: 4, category: "Self-Promotion" },

        // Drama/Arguments indicators
        { pattern: /\b(shut up|not true|stop lying|you're wrong)\b/i, weight: 3, category: "Drama/Arguments" },

        // Political content
        { pattern: /\b(politic|trump|biden|democrat|republican|election|vote)\b/i, weight: 4, category: "Political Content" },

        // Voice channel rules
        { pattern: /\b(discord voice|voice chat|voice channel|vc|voice call)\b.*\b(earrape|loud|scream|screech)\b/i, weight: 3, category: "Voice Channel Disruption" },

        // Mini-modding detection
        { pattern: /\b(stop breaking|against the rules|stop spamming|read the rules|break the rules|mod|moderator)\b/i, weight: 3, category: "Mini-Modding" },

        // Mention spam
        { pattern: /<@!?\d+>.*<@!?\d+>.*<@!?\d+>/i, weight: 4, category: "Mention Spam" },

        // SSundee-specific rules
        { pattern: /\b(ssundee sucks|hate ssundee|ssundee.*bad)\b/i, weight: 5, category: "Negativity about SSundee" }
    ];

    // Calculate violation score based on recent messages
    let violationScore = 0;
    let primaryViolation = '';
    let highestWeight = 0;
    const recentMessages = contextMessages.slice(-5); // Focus on most recent 5 messages

    // Check for message frequency/spam by user
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

        // Check content against rule violation patterns
        for (const indicator of ruleViolationPatterns) {
            if (indicator.pattern.test(msg.content)) {
                violationScore += indicator.weight;

                // Track the highest weight violation as primary
                if (indicator.weight > highestWeight) {
                    highestWeight = indicator.weight;
                    primaryViolation = indicator.category;
                }
            }
        }
    }

    // Check for rapid message spam (more than 4 messages in 10 seconds)
    for (const [userId, userData] of messagesByUser.entries()) {
        if (userData.count >= 4) {
            const timespan = Math.max(...userData.timestamps) - Math.min(...userData.timestamps);
            if (timespan < 10000) { // 10 seconds
                violationScore += 5;
                if (5 > highestWeight) {
                    highestWeight = 5;
                    primaryViolation = "Message Spam";
                }
            }
        }
    }

    // Check for repeated identical messages (content spam)
    const messageContents = recentMessages.map(m => m.content.toLowerCase());
    const uniqueContents = new Set(messageContents);
    if (messageContents.length >= 3 && uniqueContents.size <= messageContents.length / 2) {
        violationScore += 4;
        if (4 > highestWeight) {
            primaryViolation = "Content Spam";
        }
    }

    // Determine if moderation is needed based on score threshold
    // Higher score = higher chance of moderation
    const shouldModerate = violationScore >= 5;

    // Cap violation severity at 10
    const violationSeverity = Math.min(Math.ceil(violationScore / 2), 10);

    return {
        shouldModerate,
        ruleViolation: primaryViolation || "Rule Violation",
        violationSeverity
    };
}

