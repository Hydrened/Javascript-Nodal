class Class {
    constructor(app, name) {
        this.app = app;
        this.name = name;

        this.methods = {};
        this.variables = {};
        this.currentMethod = null;

        this.createMethod("Constructor");
    }

    createMethod(name) {
        this.app.manager.create(this.methods, name, "method", () => {
            this.methods[name] = new Method(this.app, this, name);
            this.openMethod(name);
        });
    }

    removeMethod(name) {

    }

    renameMethod(oldName, newName) {

    }

    openMethod(name) {
        this.app.tabs.create(this.methods[name]);
    }
};
