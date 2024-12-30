const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

class Application {
    constructor() {
        const roaming = app.getPath("appData");
        this.mainFolder = path.join(roaming, "Javascript Nodal", "data");

        this.initMainFolder();
        this.window = this.createWindow();
        this.handleEvents();
    }

    handleEvents() {
        this.window.on("resize", () => {
            const { x, y, width, height } = this.window.getBounds();
            const f = this.window.isMaximized();
            this.window.webContents.send("window-update", { x, y, width, height, f });
        });

        this.window.on("move", () => {
            const { x, y, width, height } = this.window.getBounds();
            const f = this.window.isMaximized();
            this.window.webContents.send("window-update", { x, y, width, height, f });
        });

        ipcMain.on("window-minimize", () => this.window.minimize());
        ipcMain.on("window-maximize", () => (this.window.isMaximized()) ? this.window.unmaximize() : this.window.maximize());
        ipcMain.on("window-close", () => {
            this.window.close();
        });

        ipcMain.on("get-main-folder", (e) => {
            e.reply("send-main-folder", this.mainFolder);
        });
    }

    createWindow() {
        const windowFile = path.join(this.mainFolder, "window.json");
        const jsonData = (fs.existsSync(windowFile)) ? JSON.parse(fs.readFileSync(windowFile, "utf8")) : null;

        const minW = 1150;
        const minH = 830;

        const x = (jsonData) ? jsonData.x : 0;
        const y = (jsonData) ? jsonData.y : 0;
        const w = (jsonData) ? Math.max(jsonData.w, minW) : 1280;
        const h = (jsonData) ? Math.max(jsonData.h, minH) : 720;

        const window = new BrowserWindow({
            x: x,
            y: y,
            width: w,
            height: h,
            minWidth: minW,
            minHeight: minH,
            maxWidth: 1920,
            maxHeight: 1050,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        window.loadFile("src/index.html");
        if (jsonData) if (jsonData.f) window.maximize();

        window.webContents.on("did-finish-load", () => {
            setTimeout(() => {
                const { x, y, width, height } = window.getBounds();
                const f = window.isMaximized();
                window.webContents.send("window-update", { x, y, width, height, f });
            }, 100);
        });

        return window;
    }
    
    initMainFolder() {
        if (!fs.existsSync(this.mainFolder)) fs.mkdirSync(this.mainFolder);
        
        const windowFile = path.join(this.mainFolder, "window.json");
        const windowFileData = {
            x: 0,
            y: 0,
            w: 1280,
            h: 720,
            f: true,
        };
        const strWindowFileData = JSON.stringify(windowFileData, null, 2);
        if (!fs.existsSync(windowFile)) fs.writeFile(windowFile, strWindowFileData, (err) => {
            if (err) console.error("ERROR HJN-201 => Could not write window.json:", err);
        });
    }
};

app.whenReady().then(() => {
    const applciation = new Application();
});

app.on("window-all-closed", () => {
    if (process.platform != "darwin") app.quit();
});
