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
            this.refreshInterfaces();
            if (name != "Main") this.success(`Successfully created class "${name}"`);
        } else this.error(`A class is already named "${name}"`);
    }

    removeClass(name) {
        if (this.currentClass.name == name) this.openClass("Main");
        const methods = Object.keys(this.classes[name].methods);
        const variables = Object.keys(this.classes[name].variables);

        Object.values(this.classes).filter((c) => c.name != name).forEach((c) => Object.values(c.methods).forEach((method) => method.nodes.forEach((node) => {
            if (node.data.from == name) method.removeNode(node.uid);
        })));

        delete this.classes[name];
        this.refreshInterfaces();
    }

    renameClass(oldName, newName) {
        if (oldName == newName) return false;
        if (Object.keys(this.classes).includes(newName)) {
            this.error(`Class named "${newName}" already exist`);
            return false;
        }
        this.classes[newName] = this.classes[oldName];
        this.classes[newName].name = newName;
        delete this.classes[oldName];

        Object.values(this.classes).forEach((c) => Object.values(c.methods).forEach((method) => Object.values(method.nodes).filter((node) => node.data.from == oldName).forEach((node) => node.data.from = newName)));

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
        this.elements.center.classTabs.innerHTML = "";
        this.elements.left.classList.innerHTML = "";
        this.elements.center.classMethodTabs.innerHTML = "";
        this.elements.left.methodList.innerHTML = "";
        this.elements.left.variableList.innerHTML = "";

        function refreshTabs(app, { titles, exception, parent, calls: { click } }) {
            titles.forEach((name) => {
                const li = document.createElement("li");
                if (name == exception) li.classList.add("on");
                parent.appendChild(li);
    
                const title = document.createElement("h5");
                title.textContent = name;
                li.appendChild(title);
    
                li.addEventListener("click", () => {
                    if (exception == name) return;
                    click(name);
                    app.refreshInterfaces();
                });
            });
        }
        refreshTabs(this, {
            titles: Object.keys(this.classes),
            exception: this.currentClass.name,
            parent: this.elements.center.classTabs,
            calls: {
                click: (name) => this.openClass(name),
            },
        });
        refreshTabs(this, {
            titles: Object.keys(this.currentClass.methods),
            exception: this.currentClass.currentMethod.name,
            parent: this.elements.center.classMethodTabs,
            calls: {
                click: (name) => this.currentClass.openMethod(name),
            },
        });

        function refreshLeft(app, { titles, exception, parent, calls: { rename, open, confirmRemove } }) {
            titles.forEach((name) => {
                const li = document.createElement("li");
                if (open && name != exception) li.classList.add("can-click");
                parent.appendChild(li);
    
                const input = document.createElement("input");
                input.value = name;
                input.setAttribute("readonly", "readonly");
                li.appendChild(input);
    
                let clickTimeout = null;
                if (name != exception) input.addEventListener("dblclick", () => {
                    clearTimeout(clickTimeout);
                    clickTimeout = null;
                    input.removeAttribute("readonly");
                    input.select();
                });

                if (name != exception) input.addEventListener("keydown", (e) => { if (e.key == "Enter") input.blur(); });
                if (name != exception) input.addEventListener("blur", () => {
                    const oldName = titles[[...parent.children].map((li) => li.querySelector("input:not(:read-only)")).indexOf(input)];
                    input.setAttribute("readonly", "readonly");
                    if (rename) if (!rename(oldName, input.value)) input.value = oldName;
                });

                li.addEventListener("click", () => {
                    if (clickTimeout) return;
                    clickTimeout = setTimeout(() => {
                        clickTimeout = null;
                        // if (open) open(name);
                    }, 250);
                });
    
                const cross = document.createElement("button");
                cross.textContent = "+";
                if (name == exception) cross.classList.add("disabled");
                li.appendChild(cross);
    
                if (name != exception) cross.addEventListener("click", () => new Confirm(confirmRemove.message(name), confirmRemove.options(name)));
            });
        }
        refreshLeft(this, {
            titles: Object.keys(this.classes),
            exception: "Main",
            parent: this.elements.left.classList,
            calls: {
                rename: (oldName, newName) => this.renameClass(oldName, newName),
                open: (name) => this.openClass(name),
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove class "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.removeClass(name);
                            this.success(`Successfully removed class "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        refreshLeft(this, {
            titles: Object.keys(this.currentClass.methods),
            exception: "Constructor",
            parent: this.elements.left.methodList,
            calls: {
                rename: (oldName, newName) => this.currentClass.renameMethod(oldName, newName),
                open: (name) => this.currentClass.openMethod(name),
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove method "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.currentClass.removeMethod(name);
                            this.success(`Successfully removed method "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        refreshLeft(this, {
            titles: Object.keys(this.currentClass.variables),
            exception: null,
            parent: this.elements.left.variableList,
            calls: {
                rename: (oldName, newName) => this.currentClass.renameVariable(oldName, newName),
                open: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove variable "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.currentClass.removeVariable(name);
                            this.success(`Successfully removed variable "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
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
