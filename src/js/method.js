class Method {
    constructor(app, c, name) {
        this.app = app;
        this.class = c;
        this.name = name;

        this.parameters = [];
        this.localVariables = {};
        this.uid = this.app.getNextUID(Object.values(this.class.methods).map((v) => v.uid));
    }

    open() {

    }

    close() {

    }

    createLocalVariable(name) {
        this.app.manager.create(this.localVariables, name, "local variable", () => {
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
        this.app.manager.create(this.parameters, name, "method parameter", () => {
            this.parameters.push(name);
        });    
    }

    removeParameter(name) {
        this.app.manager.remove(this.parameters, name);
    }

    renameParameter(oldName, newName) {
        return this.app.manager.rename(this.parameters, oldName, newName, "Method parameter");
    }
};
