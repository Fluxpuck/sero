const ButtonInteractions = {
    "button": "BUTTON_CLICK",
    /**
     * @OPTIONAL - It's possible to execute a command (without params)...
     * "ping": require("../commands/miscellaneous/ping")
     */
}

module.exports = async (client, interaction) => {

    /**
     * Check for button interactions that have to do with /get
     * @ButtonInteractions {Object} 
     */
    switch (ButtonInteractions[interaction.customId]) {
        case "BUTTON_CLICK":

            // PERFORM ACTIONS HERE

            break;
    }
}