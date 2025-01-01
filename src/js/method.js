class Method {
    constructor(app, c, name) {
        this.app = app;
        this.class = c;
        this.name = name;

        this.parameters = [];
        this.returns = [];
        this.pure = false;
        this.localVariables = {};
        this.uid = this.app.getNextUID(Object.values(this.class.methods).map((v) => v.uid));

        this.nodes = [];
        this.links = [];
        this.clipboard = null;

        setTimeout(() => this.createNode({ x: 0, y: 0 }, 0), 0, null);
    }

    open() {
        this.app.setGridPos({ x: 128, y: 128 });
        this.refreshNodes();
        setTimeout(() => this.refreshLinks(), 200);
    }

    close() {
        this.nodes.forEach((node) => node.hide());
        this.links.forEach((link) => link.hide());
        this.clipboard = null;
    }

    createLocalVariable(name) {
        this.app.manager.create(this.localVariables, name, null, "local variable", null, () => {
            this.localVariables[name] = undefined;
        });
    }

    removeLocalVariable(name) {
        this.app.manager.remove(this.localVariables, name);
    }

    renameLocalVariable(oldName, newName) {
        return this.app.manager.rename(this.localVariables, oldName, newName, "Local variable", ["local variable"]);
    }

    createParameter(name) {
        this.app.manager.create(this.parameters, name, null, "method parameter", [""], () => {
            this.parameters.push(name);
        });    
    }

    removeParameter(name) {
        this.app.manager.remove(this.parameters, name);
    }

    renameParameter(oldName, newName) {
        return this.app.manager.rename(this.parameters, oldName, newName, "Method parameter", ["method", "method parameter"]);
    }

    createReturn(name) {
        this.app.manager.create(this.returns, name, null, "method return", [""], () => {
            this.returns.push(name);
        });    
    }

    removeReturn(name) {
        this.app.manager.remove(this.returns, name);
    }

    renameReturn(oldName, newName) {
        return this.app.manager.rename(this.returns, oldName, newName, "Method return", ["method"]);
    }

    setLocalVariableValue(name, value) {
        if (!Object.keys(this.localVariables).includes(name)) return this.app.error(`Local variable "${name}" does not exist in this method`);
        this.localVariables[name] = value;
        return true;
    }

    setPure(value) {
        if (this.name == "Constructor") return;
        this.pure = value;
    }

    createNode(pos, id, data) {
        if (this.class != this.app.currentClass) return;
        if (!data) data = this.app.nodes[id];
        this.nodes.push(new Node(this.app, this.class, this, data, pos, id));
        this.refreshNodes();
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

    refreshNodes() {
        this.nodes.filter((node) => !node.displayed).forEach((node) => node.show());
    }

    refreshLinks() {
        this.links.filter((link) => !link.displayed).forEach((link) => link.show());
    }

    getLinksByNodeUID(uid) {
        return this.links.filter((link) => (link.data.returnNode.uid == uid) || (link.data.parameterNode.uid == uid));
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

    getNodesByLink(link) {
        return this.nodes.filter((node) => {
            return (node.element.contains(link.parameterLink) || node.element.contains(link.returnLink));
        });
    }

    removeNode(node) {
        if (node.id == 0) return this.app.error("Begin node can't be removed");

        this.nodes = this.nodes.filter((n) => n != node);
        node.hide();

        this.refreshNodes();
        this.getLinksByNodeUID(node.uid).forEach((link) => this.removeLink(link));
    }

    removeLink(link) {
        this.getNodesByLink(link).forEach((node) => this.getLinksByNodeUID(node.uid).forEach((link) => link.hide()));
        this.links = this.links.filter((l) => l != link);
        link.hide();

        this.refreshLinks();
    }

    moveFocusedNodes(velocity) {
        [...this.app.interface.elements.center.method.nodeContainer.querySelectorAll(".node.focused")].forEach((el) => {
            const node = this.getNodeByElement(el);
            node.pos.x += velocity.x;
            node.pos.y += velocity.y;
            node.snap();
            node.updatePos();

            this.getLinksByNodeUID(node.uid).forEach((link) => link.hide());
            this.refreshLinks();
        });
    }

    getNodeByUid(uid) {
        return this.nodes.filter((n) => n.uid == uid)[0];
    }

    getNodeByElement(element) {
        let res = null;
        this.app.currentClass.currentMethod.nodes.forEach((node) => {
            if (node.element.contains(element)) res = node;
        });
        return res;
    }

    copyNodes(nodes, offset) {
        this.clipboard = {
            nodes: nodes,
            offset: { x: offset.x, y: offset.y },
        };
    }

    pasteNodes(cursorPos) {
        if (!this.clipboard) return;
        this.clipboard.nodes.forEach((node) => {
            const pos = { x: node.pos.x + cursorPos.x - this.clipboard.offset.x, y: node.pos.y + cursorPos.y - this.clipboard.offset.y };
            this.createNode(pos, node.id, node.data);
            
            const newNode = this.nodes.at(-1);
            [...node.element.querySelectorAll("input")].forEach((input, index) => {
                [...newNode.element.querySelectorAll("input")][index].value = input.value;
            });

            this.getLinksByNodeUID(node.uid).forEach((link) => {
                const parameterNodeUID = link.data.parameterNode.uid;
                const returnNodeUID = link.data.returnNode.uid;
                const parameterNodeIndex = link.data.parameterNode.index;
                const returnNodeIndex = link.data.returnNode.index;

                const nodeUIDS = this.clipboard.nodes.map((node) => node.uid);
                if (nodeUIDS.includes(parameterNodeUID) && nodeUIDS.includes(returnNodeUID)) {
                    console.log(returnNodeIndex, parameterNodeIndex);
                    
                    this.linkNodes(this.getNodeByUid(returnNodeUID), returnNodeIndex, this.getNodeByUid(parameterNodeUID), parameterNodeIndex);
                }
            });
        });
    }
};
