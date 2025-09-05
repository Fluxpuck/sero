import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  InteractionResponse,
  Message,
} from "discord.js";

/**
 * Configuration options for the pagination system
 */
export interface PaginationOptions<T> {
  /** Initial page number (1-based) */
  initialPage?: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Total number of items */
  totalItems: number;
  /** Data for all pages or function to fetch data for a specific page */
  data: T[] | ((page: number, itemsPerPage: number) => Promise<T[]>);
  /** Function to create embed for a specific page */
  createEmbed: (
    items: T[],
    currentPage: number,
    totalPages: number
  ) => EmbedBuilder;
  /** Time in milliseconds before pagination controls expire (default: 5 minutes) */
  timeout?: number;
  /** Custom labels for pagination buttons */
  buttonLabels?: {
    previous?: string;
    next?: string;
  };
}

/**
 * Result of the pagination operation
 */
export interface PaginationResult {
  /** The message response object */
  response: InteractionResponse | Message;
  /** Function to manually stop the pagination */
  stop: () => void;
}

/**
 * Creates pagination row with previous/next buttons
 */
function createPaginationRow(
  currentPage: number,
  totalPages: number,
  buttonLabels: { previous: string; next: string }
): ActionRowBuilder<ButtonBuilder> | null {
  if (totalPages <= 1) return null;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("pagination_previous")
      .setLabel(buttonLabels.previous)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1),
    new ButtonBuilder()
      .setCustomId("pagination_next")
      .setLabel(buttonLabels.next)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === totalPages)
  );

  return row;
}

/**
 * Creates a paginated message with navigation buttons
 * @param response The interaction response or message to add pagination to
 * @param options Pagination configuration options
 * @returns Pagination result with control methods
 */
export async function createPagination<T>(
  response: InteractionResponse | Message,
  options: PaginationOptions<T>
): Promise<PaginationResult> {
  // Set default values
  const initialPage = options.initialPage || 1;
  const timeout = options.timeout || 300000; // 5 minutes default
  const buttonLabels = {
    previous: options.buttonLabels?.previous || "◀ Previous",
    next: options.buttonLabels?.next || "Next ▶",
  };

  // Calculate total pages
  const totalPages = Math.ceil(options.totalItems / options.itemsPerPage) || 1;

  // Current page state
  let currentPage = initialPage;

  // Function to get data for the current page
  const getPageData = async (page: number): Promise<T[]> => {
    if (typeof options.data === "function") {
      // If data is a function, call it to get the data for this page
      return await options.data(page, options.itemsPerPage);
    } else {
      // If data is an array, slice it to get the current page
      const startIndex = (page - 1) * options.itemsPerPage;
      const endIndex = startIndex + options.itemsPerPage;
      return options.data.slice(startIndex, endIndex);
    }
  };

  // Function to update the message with the new page
  const updatePage = async (page: number): Promise<void> => {
    try {
      // Get data for the requested page
      const pageData = await getPageData(page);

      // Create the embed for this page
      const embed = options.createEmbed(pageData, page, totalPages);

      // Create pagination row
      const paginationRow = createPaginationRow(page, totalPages, buttonLabels);

      // Update the message
      await response.edit({
        embeds: [embed],
        components: paginationRow ? [paginationRow] : [],
      });
    } catch (error) {
      console.error("Error updating pagination page:", error);
    }
  };

  // Set up initial page
  await updatePage(currentPage);

  // Create collector for button interactions
  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
  });

  // Handle button clicks
  collector.on("collect", async (interaction: ButtonInteraction) => {
    // Verify the interaction is for pagination
    if (!interaction.customId.startsWith("pagination_")) return;

    // Defer the update to prevent interaction timeout
    await interaction.deferUpdate();

    // Handle pagination navigation
    if (interaction.customId === "pagination_previous" && currentPage > 1) {
      currentPage--;
      await updatePage(currentPage);
    } else if (
      interaction.customId === "pagination_next" &&
      currentPage < totalPages
    ) {
      currentPage++;
      await updatePage(currentPage);
    }
  });

  // Handle collector end
  collector.on("end", async () => {
    try {
      // Remove buttons when collector expires
      // Check if the response is still editable
      if ("editable" in response && response.editable) {
        await response.edit({ components: [] });
      }
    } catch (error) {
      console.error("Failed to update message after pagination ended:", error);
    }
  });

  // Return the pagination result
  return {
    response,
    stop: () => collector.stop(),
  };
}
