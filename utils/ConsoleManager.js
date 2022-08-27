/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    The ConsoleManager collects and sends all console messages */

module.exports = {

    /** Initial welcome message to the console */
    WelcomeMessage() {
        return console.log(`
  _______  ___      __   __  __   __ 
 |       ||   |    |  | |  ||  |_|  |
 |    ___||   |    |  | |  ||       |
 |   |___ |   |    |  |_|  ||       |
 |    ___||   |___ |       | |     | 
 |   |    |       ||       ||   _   |
 |___|    |_______||_______||__| |__|
       
Startup > ${new Date().toUTCString()}`)
    },

    /** Table log all Events
     *  @param {Collection} events 
     */
    EventMessage(events) {
        //setup the event
        function Event(eventName, eventFile) {
            this.eventName = eventName;
            this.eventFile = eventFile;
        }
        //collect Events and seperate for console Table
        let EventTable = (events.map(event => new Event(event.name, event.file)));
        console.table(EventTable);
    },

    /** Table log all Commands
     *  @param {Collection} commands 
     */
    CommandMessage(commands) {
        function Command(commandName, commandCategory) {
            this.commandName = commandName;
            this.commandCategory = commandCategory;
        }
        //collect Commands and seperate for console Table
        let CommandTable = (commands.map(file => new Command(file.info.command.name, file.info.command.category)));
        console.table(CommandTable);
    }

}