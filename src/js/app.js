class App {
    constructor(mainFolder) {
        this.mainFolder = mainFolder;
        this.window = null;
        this.nodes = null;

        this.elements = {
            left: {

            },
            center: {
                blueprintTabs: document.getElementById("blueprints-tabs"),
                currentBlueprintName: document.getElementById("current-blueprint-name"),
                currentBlueprintContainer: document.getElementById("current-blueprint-container"),
                nodeContainer: document.getElementById("node-container"),
            },
            right: {

            },
        };

        this.blueprints = {};
        this.currentBlueprint = null;

        this.initData().then(() => {
            this.events = new Events(this);
            this.grid = new Grid(this);
            this.createBlueprint("Main");
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

    createBlueprint(name) {
        if (!Object.keys(this.blueprints).includes(name)) {
            this.blueprints[name] = new Blueprint(this, name);
            this.openBlueprint(name);

            const li = document.createElement("li");
            li.classList.add("on");
            this.elements.center.blueprintTabs.appendChild(li);

            const title = document.createElement("h5");
            title.textContent = name;
            li.appendChild(title);

            if (name != "Main") this.success(`Successfully created blueprint "${name}"`);

            li.addEventListener("click", () => {
                if (this.currentBlueprint.name == name) return;
                this.openBlueprint(name);
            });
        } else this.error(`A blueprint is already named "${name}"`);
    }

    openBlueprint(name) {
        if (!Object.keys(this.blueprints).includes(name)) return;
        if (this.currentBlueprint) this.currentBlueprint.close();
        this.currentBlueprint = this.blueprints[name];
        this.currentBlueprint.open();
        this.elements.center.currentBlueprintName.textContent = name;
    }

    isCurrentBP(bp) {
        return this.currentBlueprint == bp;
    }

    getLinksByNodeUID(uid) {
        return this.currentBlueprint.links.filter((link) => (link.data.returnNode.uid == uid) || (link.data.parameterNode.uid == uid));
    }

    getCursorPos(e) {
        const rect = this.elements.center.currentBlueprintContainer.getBoundingClientRect();
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

    getNextNodeUID(blueprint) {
        for (let i = 0; i <= blueprint.nodes.length; i++) if (!blueprint.nodes.some(node => node.uid === i)) return i;
        return blueprint.nodes.length;
    }

    getNextLinkUID(blueprint) {
        for (let i = 0; i <= blueprint.links.length; i++) if (!blueprint.links.some(link => link.uid === i)) return i;
        return 0;
    }

    getLinkerNbLinks(linker) {
        const li = linker.parentElement;
        const ul = li.parentElement;
        const isParameter = ul.classList.contains("input-container");
        const nodeUID = parseInt(ul.parentElement.id);
        const index = [...ul.children].indexOf(li);

        return this.currentBlueprint.links.reduce((acc, link) => {
            const data = (isParameter) ? link.data.parameterNode : link.data.returnNode;
            if (data.uid == nodeUID && data.index == index) return acc + 1;
            else return acc;
        }, 0);
    }
};
