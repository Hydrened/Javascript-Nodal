class Class {
    constructor(app, name) {
        this.app = app;
        this.name = name;

        this.parameters = [];
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
        this.app.manager.create(this.methods, name, "Constructor", "method", null, () => {
            this.methods[name] = new Method(this.app, this, name);
            this.openMethod(name);
        });
    }

    removeMethod(name) {
        const method = this.methods[name];
        if (!method) return;
        if (this.currentMethod.name == name) this.openMethod("Constructor");
        Object.keys(method.localVariables).forEach((localVariable) => method.removeLocalVariable(localVariable));
        this.app.manager.remove(this.methods, name, ["method"], null);
    }

    renameMethod(oldName, newName) {
        return this.app.manager.rename(this.methods, oldName, newName, "Method", ["method"]);
    }

    openMethod(name, force = false) {
        if (!force) if (this.currentMethod) if (name == this.currentMethod.name) return;
        if (this.currentMethod) this.currentMethod.close();
        this.currentMethod = this.methods[name];
        this.currentMethod.open();
        this.app.interface.refresh();
    }

    createVariable(name) {
        this.app.manager.create(this.variables, name, null, "variable", null, () => {
            this.variables[name] = undefined;
        });
    }

    removeVariable(name) {
        this.app.manager.remove(this.variables, name, ["class variable"], null);
    }

    renameVariable(oldName, newName) {
        return this.app.manager.rename(this.variables, oldName, newName, "Class variable", ["class variable"]);
    }

    createParameter(name) {
        this.app.manager.create(this.parameters, name, null, "class parameter", ["new instance"], () => {
            this.parameters.push(name);
        });
    }

    removeParameter(name) {
        this.app.manager.remove(this.parameters, name, ["class parameter"], ["new instance"]);
    }

    renameParameter(oldName, newName) {
        return this.app.manager.rename(this.parameters, oldName, newName, "Parameter", ["class parameter", "new instance"]);
    }

    setVariableValue(name, value) {
        if (!Object.keys(this.variables).includes(name)) return this.app.error(`Variable "${name}" does not exist in this class`);
        this.variables[name] = value;
        return true;
    }
};
