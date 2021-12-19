const winston = require("winston")
require("dotenv/config")

function logsAccess (name, message, type){
    const logsConfiguration = {
        transports : [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: `logs/${name}/errorAcess.log`,
                format: winston.format.combine(
                    winston.format.json()
                )
            })
        ],
        format: winston.format.combine(
            winston.format.timestamp({
                format: "DD-MMM-YYYY HH:mm:ss"
            }),
            winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
        )
    }
    const logger = winston.createLogger(logsConfiguration)

    switch (type) {
        case "error":
            logger.error(message)
            break;
    
        case "info":
            logger.info(message)
            break;
    }
}


module.exports = {
    logsAccess
}
