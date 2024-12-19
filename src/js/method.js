class Method {
    constructor(app, c, name) {
        this.app = app;
        this.class = c;
        this.name = name;

        this.nodes = [];
        this.links = [];

        this.uid = this.class.getNextMethodUID();

        setTimeout(() => this.createNode({ x: 0, y: 0 }, 0), 0);
    }

    open() {
        this.app.grid.pos = { x: 128, y: 128 };
        this.app.grid.updatePos();
        this.app.elements.center.currentClassMethodName.textContent = this.name;
        this.refreshNodes();
        setTimeout(() => this.refreshLinks(), 200);
    }

    close() {
        this.nodes.forEach((node) => node.hide());
        this.links.forEach((link) => link.hide());
    }

    createNode(pos, id, data) {
        if (this.class != this.app.currentClass) return;
        if (!data) data = this.app.nodes[id];
        if (!data) return;
        this.nodes.push(new Node(this.app, this.class, this, data, pos, id));
        this.refreshNodes();
    }

    removeNode(uid) {
        let err = false;
        this.nodes = this.nodes.filter((node) => {
            if (node.uid == uid) {
                if (node.id == 0) {
                    this.app.error(`You can't remove a "${node.data.title}" node`);
                    err = true;
                    return true;
                } else node.hide();
                return false;
            } else return true;
        });
        if (err) return;
        this.refreshNodes();
        this.getLinksByNodeUID(uid).forEach((link) => this.removeLink(link.uid));
    }

    refreshNodes() {
        this.nodes.filter((node) => !node.displayed).forEach((node) => node.show());
    }

    linkNodes(returnNode, returnIndex, parameterNode, parameterIndex) {
        if (returnNode.uid == parameterNode.uid) return;

        const returnType = returnNode.data.returns[returnIndex].type;
        const parameterType = parameterNode.data.parameters[parameterIndex].type;
        if (returnType != parameterType) return;

        this.links.push(new Link(this.app, this.class, this, {
            returnNode: {
                uid: returnNode.uid,
                index: returnIndex,
            },
            parameterNode: {
                uid: parameterNode.uid,
                index: parameterIndex,
            },
        }));

        this.getLinksByNodeUID(parameterNode.uid).forEach((link) => link.hide());
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

    getNextNodeUID() {
        for (let i = 0; i <= this.nodes.length; i++) if (!this.nodes.some(node => node.uid == i)) return i;
        return this.nodes.length;
    }

    getNextLinkUID() {
        for (let i = 0; i <= this.links.length; i++) if (!this.links.some(link => link.uid == i)) return i;
        return 0;
    }

    getLinkerNbLinks(linker) {
        const li = linker.parentElement;
        const ul = li.parentElement;
        const isParameter = ul.classList.contains("input-container");
        const nodeUID = parseInt(ul.parentElement.id);
        const index = [...ul.children].indexOf(li);

        return this.links.reduce((acc, link) => {
            const data = (isParameter) ? link.data.parameterNode : link.data.returnNode;
            if (data.uid == nodeUID && data.index == index) return acc + 1;
            else return acc;
        }, 0);
    }

    getLinksByNodeUID(uid) {
        return this.links.filter((link) => (link.data.returnNode.uid == uid) || (link.data.parameterNode.uid == uid));
    }
};
