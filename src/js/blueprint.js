class Blueprint {
    constructor(app, name) {
        this.app = app;
        this.name = name;
        this.nodes = [];
        this.links = [];

        setTimeout(() => {
            this.createNode({ x: 0, y: 0 }, 0);
            this.createNode({ x: 400, y: 0 }, 1);
            this.createNode({ x: 0, y: 120 }, 100);
            this.createNode({ x: 700, y: 120 }, 1);
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

    refreshLinks() {
        this.links.filter((link) => !link.displayed).forEach((link) => link.show());
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

    linkNodes(returnNode, returnIndex, parameterNode, parameterIndex) {
        if (returnNode.uid == parameterNode.uid) return;

        const returnType = returnNode.data.returns[returnIndex].type;
        const parameterType = parameterNode.data.parameters[parameterIndex].type;
        if (returnType != parameterType) return;

        this.links.push(new Link(this.app, this, {
            returnNode: {
                uid: returnNode.uid,
                index: returnIndex,
            },
            parameterNode: {
                uid: parameterNode.uid,
                index: parameterIndex,
            },
        }));

        this.refreshLinks();
    }

    removeLink(uid) {
        this.links = this.links.filter((link) => link.uid != uid);
        this.refreshLinks();
    }
};
