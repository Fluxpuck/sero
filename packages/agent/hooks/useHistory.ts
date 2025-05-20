/**
 * useHistory.ts
 * A hook for managing conversation history with Claude AI
 */
import NodeCache from 'node-cache';

/**
 * Interface for web search results
 */
interface WebSearchResult {
    title: string;
    page_age_url: string;
    page_url: string;
}

/**
 * Interface for a single conversation exchange
 */
interface HistoryItem {
    prompt: string;
    response: string;
    timestamp: number;
    webSearchResults?: WebSearchResult[];
}

/**
 * Interface for the conversation history
 */
interface ConversationHistory {
    conversationKey: string;
    history: HistoryItem[];
}

const MAX_HISTORY_LENGTH = 10;
// TTL of 60 minutes (in seconds)
const CACHE_TTL = 60 * 60;

/**
 * Hook for managing conversation history with Claude AI
 * Stores up to 10 previous exchanges and manages the conversation key
 * with a 60-minute TTL using node-cache
 */
export const useHistory = () => {
    // Initialize cache with default TTL of 60 minutes
    const historyCache = new NodeCache({
        stdTTL: CACHE_TTL,
        checkperiod: CACHE_TTL * 0.2, // Check for expired keys every 12 minutes
        useClones: true
    });

    // Initialize or retrieve existing history from cache
    const getHistory = (conversationKey: string): ConversationHistory => {
        // Try to get history from cache first
        const cachedHistory = historyCache.get<ConversationHistory>(conversationKey);
        if (cachedHistory) {
            return cachedHistory;
        }

        // Create a new history if one doesn't exist in cache
        const newHistory = {
            conversationKey,
            history: [],
        };

        // Store the new history in cache
        historyCache.set(conversationKey, newHistory);

        return newHistory;
    };    /**
     * Add a new exchange to the history
     * @param history - Current conversation history
     * @param prompt - User's prompt
     * @param response - Claude's response
     * @param webSearchResults - Optional web search results from Claude
     * @returns Updated conversation history
     */
    const addToHistory = (
        history: ConversationHistory,
        prompt: string,
        response: string,
        webSearchResults?: WebSearchResult[]
    ): ConversationHistory => {
        const newHistoryItem: HistoryItem = {
            prompt,
            response,
            timestamp: Date.now(),
            webSearchResults,
        };

        // Create a new history array with the new item at the beginning
        // and limit to MAX_HISTORY_LENGTH items
        const updatedHistory = [
            newHistoryItem,
            ...history.history,
        ].slice(0, MAX_HISTORY_LENGTH);

        const updatedHistoryObject = {
            ...history,
            history: updatedHistory,
        };

        // Update the cache with the new history object
        // This also resets the TTL for this key
        historyCache.set(history.conversationKey, updatedHistoryObject);

        return updatedHistoryObject;
    };

    /**
     * Format history for inclusion in Claude's context
     * @param history - Conversation history to format
     * @returns Formatted history string
     */    const formatHistoryForContext = (history: ConversationHistory): string => {
        if (!history.history.length) return '';

        // Sort history by timestamp (newest last)
        const sortedHistory = [...history.history].reverse();

        let formattedHistory = '# Previous Conversation History\n\n';

        sortedHistory.forEach((item, index) => {
            formattedHistory += `## Exchange ${index + 1}\n`;
            formattedHistory += `User: ${item.prompt}\n\n`;

            // Include web search results if available
            if (item.webSearchResults && item.webSearchResults.length > 0) {
                formattedHistory += `Web Search Results:\n`;
                item.webSearchResults.forEach(result => {
                    formattedHistory += `- ${result.title}: ${result.page_url}\n`;
                });
                formattedHistory += `\n`;
            }

            formattedHistory += `Claude: ${item.response}\n\n`;
        });

        return formattedHistory;
    };

    /**
     * Get the conversation key
     * @param history - Current conversation history
     * @returns Conversation key string
     */
    const getConversationKey = (history: ConversationHistory): string => {
        return history.conversationKey;
    };

    /**
     * Set a new conversation key
     * @param history - Current conversation history
     * @param newKey - New conversation key to set
     * @returns Updated conversation history
     */    const setConversationKey = (
        history: ConversationHistory,
        newKey: string
    ): ConversationHistory => {
        // Delete old key from cache
        historyCache.del(history.conversationKey);

        // Create updated history object with new key
        const updatedHistory = {
            ...history,
            conversationKey: newKey,
        };

        // Store with new key
        historyCache.set(newKey, updatedHistory);

        return updatedHistory;
    };

    /**
     * Clear the conversation history but keep the key
     * @param history - Current conversation history
     * @returns Updated conversation history with empty history array
     */    const clearHistory = (history: ConversationHistory): ConversationHistory => {
        const clearedHistory = {
            ...history,
            history: [],
        };

        // Update in cache
        historyCache.set(history.conversationKey, clearedHistory);

        return clearedHistory;
    };    /**
     * Check if a conversation exists in the cache
     * @param conversationKey - The key to check
     * @returns Boolean indicating if the key exists
     */
    const hasConversation = (conversationKey: string): boolean => {
        return historyCache.has(conversationKey);
    };

    /**
     * Delete a conversation from the cache
     * @param conversationKey - The key to delete
     * @returns Boolean indicating if the key was deleted successfully
     */
    const deleteConversation = (conversationKey: string): boolean => {
        return historyCache.del(conversationKey) > 0;
    };

    /**
     * Get TTL (time to live) for a conversation in seconds
     * @param conversationKey - The key to check
     * @returns Remaining TTL in seconds or -1 if not found or expired
     */
    const getConversationTTL = (conversationKey: string): number => {
        const ttl = historyCache.getTtl(conversationKey);
        return ttl === undefined ? -1 : ttl;
    };

    /**
     * Get statistics about the cache
     */
    const getCacheStats = () => {
        return historyCache.getStats();
    };

    return {
        getHistory,
        addToHistory,
        formatHistoryForContext,
        getConversationKey,
        setConversationKey,
        clearHistory,
        hasConversation,
        deleteConversation,
        getConversationTTL,
        getCacheStats,
    };
};

export default useHistory;