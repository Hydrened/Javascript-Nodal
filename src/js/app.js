class App {
    constructor(mainFolder) {
        this.mainFolder = mainFolder;

        this.classes = {};
        this.currentClass = null;

        this.initData().then(() => {
            this.manager = new Manager(this);
            this.interface = new Interface(this);
            this.events = new Events(this);

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
        return true;
    }

    error(message) {
        new Message(this, "error", message);
        return false;
    }

    createClass(name) {
        this.manager.create(this.classes, name, "class", () => {
            this.classes[name] = new Class(this, name);
            this.openClass(name);
        });
    }

    removeClass(name) {
        this.manager.remove(this.classes, name);
    }

    renameClass(oldName, newName) {
        return this.manager.rename(this.classes, oldName, newName, "Class");
    }

    openClass(name) {
        this.currentClass = this.classes[name];
        this.currentClass.open();
        this.interface.refresh();
    }

    getNextUID(uids) {
        for (let i = 0; i <= uids.length; i++) if (!uids.some(uid => uid == i)) return i;
        return 0;
    }

    getNextName(array, type) {
        if (!Array.isArray(array)) array = Object.keys(array);
        const defaultNames = array.filter((name) => name.includes(type));
        if (defaultNames.includes(type)) {
            let i = 2;
            while (true && i < 1000) {
                if (!defaultNames.includes(`${type} ${i}`)) return `${type} ${i}`;
                i++;
            }
        } else return type;
    }
};
