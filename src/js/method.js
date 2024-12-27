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
    }

    createLocalVariable(name) {
        this.app.manager.create(this.localVariables, name, null, "local variable", () => {
            this.localVariables[name] = undefined;
        });
    }

    removeLocalVariable(name) {
        this.app.manager.remove(this.localVariables, name);
    }

    renameLocalVariable(oldName, newName) {
        return this.app.manager.rename(this.localVariables, oldName, newName, "Local variable");
    }

    createParameter(name) {
        this.app.manager.create(this.parameters, name, null, "method parameter", () => {
            this.parameters.push(name);
        });    
    }

    removeParameter(name) {
        this.app.manager.remove(this.parameters, name);
    }

    renameParameter(oldName, newName) {
        return this.app.manager.rename(this.parameters, oldName, newName, "Method parameter");
    }

    createReturn(name) {
        this.app.manager.create(this.returns, name, null, "method return", () => {
            this.returns.push(name);
        });    
    }

    removeReturn(name) {
        this.app.manager.remove(this.returns, name);
    }

    renameReturn(oldName, newName) {
        return this.app.manager.rename(this.returns, oldName, newName, "Method return");
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
};
