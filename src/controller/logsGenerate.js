const winston = require("winston")
require("dotenv/config")

function logsAccess (name, menssage){
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

    logger.error(menssage)
}


module.exports = {
    logsAccess
}
