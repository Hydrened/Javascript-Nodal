class Class {
    constructor(app, name) {
        this.app = app;
        this.name = name;

        this.methods = {};
        this.variables = {};
        this.currentMethod = null;

        this.createMethod("Constructor");
    }

    open() {
        this.openMethod("Constructor");
    }

    close() {
        this.currentMethod.close();
        this.currentMethod = null;
    }

    createMethod(name) {
        if (!Object.keys(this.methods).includes(name)) {
            this.methods[name] = new Method(this.app, this, name);
            this.openMethod(name);
            if (name != "Constructor") this.app.success(`Successfully created method "${name}"`);
            setTimeout(() => this.app.refreshInterfaces(), 0);
        } else this.app.error(`A method is already named "${name}"`);
    }

    removeMethod(name) {
        if (this.app.currentClass.currentMethod.name == name) this.app.currentClass.openMethod("Constructor");
        Object.values(this.app.classes).forEach((c) => Object.entries(c.methods).forEach(([methodName, methodValue]) => {
            if (methodName != name) methodValue.nodes.filter((n) => n.data.title == name && n.data.type == "method").forEach((n) => methodValue.removeNode(n.uid));
        }));
        delete this.methods[name];
        this.app.refreshInterfaces();
    }

    renameMethod(oldName, newName) {
        if (oldName == newName || newName == "") return false;
        if (Object.keys(this.methods).includes(newName)) {
            this.app.error(`Method named "${newName}" already exist`);
            return false;
        }

        this.methods[newName] = this.methods[oldName];
        this.methods[newName].name = newName;
        delete this.methods[oldName];
        
        Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((method) => Object.values(method.nodes).filter((node) => node.data.title == oldName && node.data.type == "method").forEach((node) => node.data.title = newName)));
        this.openMethod(this.currentMethod.name, true);
        
        this.app.refreshInterfaces();
        this.app.success(`Successfully renamed method "${oldName}" to "${newName}"`);
        return true;
    }

    openMethod(name, force = false) {
        if (!force) if (this.currentMethod) if (name == this.currentMethod.name) return;
        if (this.currentMethod) this.currentMethod.close();
        this.currentMethod = this.methods[name];
        this.currentMethod.open();
    }

    createVariable(name) {
        if (!Object.keys(this.variables).includes(name)) {
            this.variables[name] = undefined;
            this.app.success(`Successfully created variable "${name}"`);
            setTimeout(() => this.app.refreshInterfaces(), 0);
        } else this.app.error(`A variable is already named "${name}"`);
    }

    removeVariable(name) {
        Object.values(this.app.classes).forEach((c) => Object.entries(c.methods).forEach(([methodName, methodValue]) => {
            methodValue.nodes.filter((n) => (n.data.title == `Get ${name}` || n.data.title == `Set ${name}`) && n.data.type == "variable").forEach((n) => methodValue.removeNode(n.uid));
        }));
        delete this.variables[name];
        this.app.refreshInterfaces();
    }

    renameVariable(oldName, newName) {
        if (oldName == newName || newName == "") return false;
        if (Object.keys(this.variables).includes(newName)) {
            this.app.error(`Variable named "${newName}" already exist`);
            return false;
        }
        this.variables[newName] = this.variables[oldName];
        delete this.variables[oldName];

        Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((method) => Object.values(method.nodes).filter((node) => (node.data.title == `Get ${oldName}` || node.data.title == `Set ${oldName}`) && node.data.type == "variable" && node.data.from == this.name).forEach((node) => node.data.title = `${node.data.title.slice(0, 4)} ${newName}`)));
        this.openMethod(this.currentMethod.name, true);

        this.app.refreshInterfaces();
        this.app.success(`Successfully renamed variable "${oldName}" to "${newName}"`);
        return true;
    }

    getNextMethodUID() {
        const methods = Object.values(this.methods);
        for (let i = 0; i <= methods.length; i++) if (!methods.some(method => method.uid == i)) return i;
        return 0;
    }
}
