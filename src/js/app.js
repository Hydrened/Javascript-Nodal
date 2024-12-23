class App {
    constructor(mainFolder) {
        this.mainFolder = mainFolder;

        this.elements = {
            center: {
                tabContainer: document.getElementById("method-tabs"),
            },
        };
        this.classes = {};
        this.currentClass = null;

        this.initData().then(() => {
            this.manager = new Manager(this);
            this.tabs = new Tabs(this);

            this.createClass("Main");
        });
    }

    async initData() {
        const readWindow = fsp.readFile(path.join(this.mainFolder, "window.json"), "utf8").then((data) => {
            const jsonData = JSON.parse(data);
            this.window = jsonData;
        }).catch(err => this.error("ERROR HJN-102 => Could not read window.json:", err));
        
        const readNodes = fsp.readFile(path.join(__dirname, "..", "data", "nodes.json"), "utf8").then((data) => {
            const jsonData = JSON.parse(data);
            this.nodes = jsonData;
        }).catch(err => this.error("ERROR HJN-103 => Could not read nodes.json:", err));

        return Promise.all([readWindow, readNodes]).then().catch(err => this.error("ERROR HJN-104 => Could not read json files:", err));
    }

    success(message) {
        new Message(this, "success", message);
    }

    error(message) {
        new Message(this, "error", message);
    }

    createClass(name) {
        this.manager.create(name, this.classes, "method", () => {
            this.classes[name] = new Class(this, name);
            this.openClass(name);
        });
    }

    removeClass(name) {

    }

    renameClass(oldName, newName) {

    }

    openClass(name) {

    }
};
