const chokidar = require("chokidar");
const {stringify} = require("@kne/md-doc");
const watchDocDir = ({devServerConfig}, {target, callback}) => {
    const onBeforeSetupMiddleware = devServerConfig.onBeforeSetupMiddleware;
    devServerConfig.onBeforeSetupMiddleware = (...args) => {
        chokidar.watch(target).on("all", async (event, dir) => {
            const {name, baseDir} = callback({event, dir});
            if (!name) {
                return;
            }
            try {
                await stringify({baseDir, name})
            } catch (e) {
                console.error(e);
            }
        });
        onBeforeSetupMiddleware && onBeforeSetupMiddleware(...args);
    };

    return devServerConfig;
};

module.exports = watchDocDir;
