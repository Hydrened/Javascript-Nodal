class Blueprint {
    constructor(app, name) {
        this.app = app;
        this.name = name;
        this.nodes = [];

        setTimeout(() => {
            this.createNode({ x: 0, y: 0 }, 0);
            this.createNode({ x: 400, y: 0 }, 1);
            this.createNode({ x: 0, y: 120 }, 100);
        }, 0);
    }

    open() {
        this.refreshNodes();
    }

    close() {
        this.nodes.forEach((node) => node.hide());
    }

    refreshNodes() {
        this.nodes.filter((node) => !node.displayed).forEach((node) => node.show());
    }

    createNode(pos, id) {
        if (this != this.app.currentBlueprint) return;
        const data = this.app.nodes[id];
        if (!data) return;
        this.nodes.push(new Node(this.app, this, data, pos, id));
        this.refreshNodes();
    }

    removeNode(uid) {
        this.nodes = this.nodes.filter((node) => node.uid != uid);
        this.refreshNodes();
    }
};
