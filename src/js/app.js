class App {
    constructor(mainFolder) {
        this.mainFolder = mainFolder;
        this.window = null;
        this.nodes = null;

        this.elements = {
            left: {
                currentClass: document.getElementById("current-class-title"),
                classList: document.getElementById("class-list-container"),
                methodList: document.getElementById("method-list-container"),
                variableList: document.getElementById("variable-list-container"),
                localVariableList: document.getElementById("local-variable-list-container"),
            },
            center: {
                classTabs: document.getElementById("classes-tabs"),
                classMethodTabs: document.getElementById("classes-method-tabs"),
                currentClassMethodName: document.getElementById("current-class-method-name"),
                currentClassContainer: document.getElementById("current-class-container"),
                nodeContainer: document.getElementById("node-container"),
            },
            right: {

            },
        };

        this.classes = {};
        this.currentClass = null;

        this.initData().then(() => {
            this.events = new Events(this);
            this.grid = new Grid(this);
            this.interface = new Interface(this);
            this.createClass("Main");
        });
    }

    success(message) {
        new Message(this, "success", message);
    }

    error(message) {
        new Message(this, "error", message);
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

    createClass(name) {
        if (!Object.keys(this.classes).includes(name)) {
            this.classes[name] = new Class(this, name);
            this.openClass(name);
            this.refreshInterfaces();
            if (name != "Main") this.success(`Successfully created class "${name}"`);
        } else this.error(`A class is already named "${name}"`);
    }

    removeClass(name) {
        if (this.currentClass.name == name) this.openClass("Main");
        const methods = Object.keys(this.classes[name].methods);
        const variables = Object.keys(this.classes[name].variables);

        Object.values(this.classes).filter((c) => c.name != name).forEach((c) => Object.values(c.methods).forEach((method) => method.nodes.forEach((node) => {
            if (node.data.from == name && node.data.type == "new instance") method.removeNode(node.uid);
        })));

        delete this.classes[name];
        this.refreshInterfaces();
    }

    renameClass(oldName, newName) {
        if (oldName == newName || newName == "") return false;
        if (Object.keys(this.classes).includes(newName)) {
            this.error(`Class named "${newName}" already exist`);
            return false;
        }
        this.classes[newName] = this.classes[oldName];
        this.classes[newName].name = newName;
        delete this.classes[oldName];

        Object.values(this.classes).forEach((c) => Object.values(c.methods).forEach((method) => {
            Object.values(method.nodes).filter((node) => node.data.from == oldName).forEach((node) => node.data.from = newName);
            Object.values(method.nodes).filter((node) => node.data.type == "new instance").forEach((node) => node.data.title = `New ${newName} instance`);
        }));
        this.currentClass.openMethod(this.currentClass.currentMethod.name, true);

        this.refreshInterfaces();
        this.success(`Successfully renamed class "${oldName}" to "${newName}"`);
        return true;
    }

    openClass(name) {
        if (this.currentClass) if (this.currentClass.name == name) return;
        if (this.currentClass) this.currentClass.close();
        this.currentClass = this.classes[name];
        this.currentClass.open();
    }

    refreshInterfaces() {
        this.interface.refresh();
    }

    isCurrentBP(bp) {
        return this.currentClass == bp;
    }

    getCursorPos(e) {
        const rect = this.elements.center.currentClassContainer.getBoundingClientRect();
        const offset = {
            x: e.x - rect.x,
            y: e.y - rect.y,
        };
        return {
            x: offset.x - this.grid.pos.x,
            y: offset.y - this.grid.pos.y,
        }
    }

    destroyContextMenu() {
        this.events.ctxMenu.destroy();
        this.events.ctxMenu = null;
    }
};
