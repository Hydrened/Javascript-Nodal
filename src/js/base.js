const { ipcRenderer, shell } = require("electron");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

window.addEventListener("load", () => {
    ipcRenderer.send("get-main-folder");
    ipcRenderer.on("send-main-folder", (e, mainFolder) => {
        const app = new App(mainFolder);
        const frame = new Frame();
        const subFrame = new SubFrame(app);

        window.addEventListener("beforeunload", (e) => {
            try {
                const windowFile = path.join(mainFolder, "window.json");
                const windowData = JSON.parse(fs.readFileSync(windowFile, "utf8"));

                if (app.window.x < 0) app.window.x = 0;
                if (app.window.y < 0) app.window.y = 0;

                const strWindowData = JSON.stringify(app.window, null, 2);
                fs.writeFileSync(windowFile, strWindowData, "utf8");
            } catch (err) {
                console.error("ERROR HJN-301 => Could not save window.json", err);
            }
        });
    });
});
