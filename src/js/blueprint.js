class Blueprint {
    constructor(app, name) {
        this.app = app;
        this.name = name;
        this.methods = {};
        this.nodes = [];
        this.links = [];

        setTimeout(() => {
            this.createMethod("Constructor");
            this.createNode({ x: -400, y: 0 }, 0);
            this.createNode({ x: 0, y: -50 }, 10);
            this.createNode({ x: -400, y: 120 }, 100);
            this.createNode({ x: 300, y: 0 }, 1);
        }, 0);
    }

    open() {
        this.refreshNodes();
        this.refreshLinks();
    }

    close() {
        this.nodes.forEach((node) => node.hide());
    }

    createMethod(name) {
        
    }

    removeMethod(uid) {

    }

    createNode(pos, id) {
        if (this != this.app.currentBlueprint) return;
        const data = this.app.nodes[id];
        if (!data) return;
        this.nodes.push(new Node(this.app, this, data, pos, id));
        this.refreshNodes();
    }

    removeNode(uid) {
        this.nodes = this.nodes.filter((node) => {
            if (node.uid == uid) {
                if (node.id <= 1) {
                    this.app.error(`You can't remove a "${node.data.title}" node`);
                    return true;
                } else node.hide();
                return false;
            } else return true;
        });
        this.refreshNodes();
        this.app.getLinksByNodeUID(uid).forEach((link) => this.removeLink(link.uid));
    }

    refreshNodes() {
        this.nodes.filter((node) => !node.displayed).forEach((node) => node.show());
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

        this.app.getLinksByNodeUID(parameterNode.uid).forEach((link) => link.hide());
        this.links.at(-1).show();
        setTimeout(() => this.refreshLinks(), 0);
    }

    removeLink(uid) {
        const toHide = [];
        this.links = this.links.filter((link) => {
            if (link.uid == uid) {
                toHide.push(link);
                return false;
            } else return true;
        });
        toHide.forEach((link) => link.hide());
        this.refreshLinks();
    }

    refreshLinks() {
        this.links.filter((link) => !link.displayed).forEach((link) => link.show());
    }
};
