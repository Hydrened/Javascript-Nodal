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

    sucess(message) {
        console.log(message);
    }

    error(message) {
        console.log(message);
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
};
