const { getRequest } = require("../database/connection");

const MIN_COMMAND_AMOUNT = 6;

module.exports = async (client) => {
  let count = 0;

  // Fetch Application Commands from Client & Commands from Database
  const APPLICATION_COMMANDS = await client.application.commands.fetch();
  const DATABASE_COMMANDS = await getRequest("/commands");

  const application_commands = Array.from(APPLICATION_COMMANDS.values());
  const database_commands = DATABASE_COMMANDS?.data || [];

  // Iterate over database commands
  for (const database_command of database_commands) {
    // Find the application command
    const application_command = application_commands.find(
      (cmd) => cmd.name === database_command.name
    );

    if (!application_command) {
      try {
        // Create new application command
        await client.application.commands.create({
          name: database_command.name,
          description: database_command.description,
          options: database_command.interaction?.options || [],
        });

        console.log(
          "\x1b[36m",
          `[Client]: ${database_command.name} created successfully.`
        );

        count++;
      } catch (error) {
        console.error(
          `[Error]: Something went wrong trying to create the application ${database_command.name}`,
          error
        );
      }
    } else {
      try {
        // Update application command
        await application_command.edit({
          name: database_command.name,
          description: database_command.description,
          options: database_command.interaction?.options || [],
        });

        console.log(
          "\x1b[34m",
          `[Client]: ${database_command.name} updated successfully.`
        );

        count++;
      } catch (error) {
        console.error(
          `[Error]: Something went wrong trying to update the application ${database_command.name}`,
          error
        );
      }
    }
  }

  console.log("\x1b[32m", `[Client]: ${count} commands deployed successfully.`);

  const DB_COUNT = database_commands.length;
  const APP_COUNT = application_commands.length;
  // If the number of commands in the database is not equal to the number of commands in the application, delete the extra commands from the application.
  if (DB_COUNT != APP_COUNT) {
    for (const application_command of application_commands) {
      const database_command = database_commands.find(
        (cmd) => cmd.name === application_command.name
      );

      if (!database_command) {
        try {
          // Delete application command
          await application_command.delete();
          console.log(
            "\x1b[31m",
            `[Client]: ${application_command.name} deleted from application commands.`
          );
        } catch (error) {
          console.error(
            `[Error]: Something went wrong trying to delete the application ${application_command.name}`,
            error
          );
        }
      }
    }
  }

  return;
};
