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
    }

    open() {

    }

    close() {

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
};
