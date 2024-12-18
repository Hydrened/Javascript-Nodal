class App {
    constructor(mainFolder) {
        this.mainFolder = mainFolder;
        this.window = null;
        this.nodes = null;

        this.elements = {
            left: {
                classList: document.getElementById("class-list-container"),
                methodList: document.getElementById("method-list-container"),
                variableList: document.getElementById("variable-list-container"),
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
            this.refreshClassInterfaces();
            this.refreshMethodInterfaces();
            if (name != "Main") this.success(`Successfully created class "${name}"`);
        } else this.error(`A class is already named "${name}"`);
    }

    removeClass(name) {
        if (this.currentClass.name == name) this.openClass("Main");
        delete this.classes[name];
        this.refreshClassInterfaces();
        this.refreshMethodInterfaces();
    }

    openClass(name) {
        if (this.currentClass) this.currentClass.close();
        this.currentClass = this.classes[name];
        this.currentClass.open();
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

    refreshClassInterfaces() {
        this.elements.center.classTabs.innerHTML = "";
        this.elements.left.classList.innerHTML = "";

        Object.keys(this.classes).forEach((name) => {
            const tab = document.createElement("li");
            if (name == this.currentClass.name) tab.classList.add("on");
            this.elements.center.classTabs.appendChild(tab);

            const title = document.createElement("h5");
            title.textContent = name;
            tab.appendChild(title);

            tab.addEventListener("click", () => {
                if (this.currentClass.name == name) return;
                this.openClass(name);
                this.refreshClassInterfaces();
                this.refreshMethodInterfaces();
            });

            const li = document.createElement("li");
            this.elements.left.classList.appendChild(li);

            const input = document.createElement("input");
            input.value = name;
            input.setAttribute("readonly", "readonly");
            li.appendChild(input);

            if (name != "Main") input.addEventListener("dblclick", () => {
                input.removeAttribute("readonly");
            });

            const cross = document.createElement("button");
            cross.textContent = "+";
            if (name == "Main") cross.classList.add("disabled");
            li.appendChild(cross);

            if (name != "Main") cross.addEventListener("click", () => new Confirm(`Are you sure you wan to remove class "${name}"?`, [
                { button: "Yes", call: () => {
                    this.removeClass(name);
                    this.success(`Successfully removed class "${name}"`);
                }},
                { button: "Cancel", call: null },
            ]));
        });
    }

    refreshMethodInterfaces() {
        this.elements.center.classMethodTabs.innerHTML = "";
        this.elements.left.methodList.innerHTML = "";
        this.elements.left.variableList.innerHTML = "";

        Object.keys(this.currentClass.methods).forEach((name) => {
            const tab = document.createElement("li");
            if (name == this.currentClass.currentMethod.name) tab.classList.add("on");
            this.elements.center.classMethodTabs.appendChild(tab);

            const title = document.createElement("h5");
            title.textContent = name;
            tab.appendChild(title);

            tab.addEventListener("click", () => {
                this.currentClass.openMethod(name);
                this.refreshMethodInterfaces();
            });

            const li = document.createElement("li");
            this.elements.left.methodList.appendChild(li);

            const input = document.createElement("input");
            input.value = name;
            input.setAttribute("readonly", "readonly");
            li.appendChild(input);

            if (name != "Constructor") input.addEventListener("dblclick", () => {
                input.removeAttribute("readonly");
            });

            const cross = document.createElement("button");
            cross.textContent = "+";
            if (name == "Constructor") cross.classList.add("disabled");
            li.appendChild(cross);

            if (name != "Constructor") cross.addEventListener("click", () => new Confirm(`Are you sure you wan to remove method "${name}"?`, [
                { button: "Yes", call: () => {
                    this.currentClass.removeMethod(name);
                    this.success(`Successfully removed method "${name}"`);
                }},
                { button: "Cancel", call: null },
            ]));
        });
    }
};
