class Frame {
    constructor() {
        this.elements = {
            title: document.getElementById("window-title"),
            minimize: document.getElementById("frame-minimize"),
            maximize: document.getElementById("frame-maximize"),
            close: document.getElementById("frame-close"),
        };

        this.initTitle();
        this.handleEvents();
    }

    initTitle() {
        const packageFile = path.join(__dirname, "..", "package.json");
        fsp.readFile(packageFile, "utf8").then((data) => {
            const jsonData = JSON.parse(data);
            this.elements.title.textContent = `${jsonData.name} ${jsonData.version}`;
        }).catch((readErr) => console.error("ERROR HJN-101 => Could not read package.json:" + readErr));
    }

    handleEvents() {
        this.elements.minimize.addEventListener("click", () => ipcRenderer.send("window-minimize"));
        this.elements.maximize.addEventListener("click", () => ipcRenderer.send("window-maximize"));
        this.elements.close.addEventListener("click", () => ipcRenderer.send("window-close"));
    }
};
