const fs = require("fs");
const { join, dirname, basename } = require("path");
const { postRequest } = require("../database/connection");

function isDir(filePath) {
  // Check if the path exists and is a directory.
  // Returns true if both conditions are met, false otherwise.
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
}

module.exports = {
  async loadCommands(
    client,
    directoryPath,
    accumulator = { count: 0 },
    isTopLevel = true
  ) {
    // list files and directories
    const files = fs.readdirSync(directoryPath);

    for await (const file of files) {
      const filePath = join(directoryPath, file);
      const directoryCategory = basename(dirname(filePath));

      if (isDir(filePath)) {
        // If the file is a directory, call the function recursively with the subdirectory path
        await module.exports.loadCommands(client, filePath, accumulator, false);
      } else if (file.endsWith(".js")) {
        // If the file is a JavaScript file, load the command from the file
        const command = require(filePath);
        if (command) {
          // Add the directoryCategory to the props
          command.props.category = directoryCategory;
          // Set the command in the client's collection
          client.commands.set(command.props.commandName, command);

          postRequest("/commands", {
            name: command.props.commandName,
            description: command.props.description,
            usage: command.props.usage,
            interactionType: command.props.interaction.type,
            interactionOptions: command.props.interaction.options,
            defaultMemberPermissions: command.props.defaultMemberPermissions,
            cooldown: command.props.cooldown || null,
          });

          // Log the command to the console if in development mode
          if (process.env.NODE_ENV === "development") {
            console.log(
              "\x1b[2m",
              `[Client]: Initialized ${command.props.commandName}`
            );
          }

          accumulator.count++;
        }
      }
    }

    // Log the total number of commands loaded if in development mode
    if (isTopLevel && process.env.NODE_ENV === "development") {
      console.log(
        "\x1b[7m",
        `[Client]: ${accumulator.count} commands loaded successfully.`
      );
    }
  },
};
