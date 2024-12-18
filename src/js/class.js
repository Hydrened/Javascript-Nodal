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
            setTimeout(() => this.app.refreshMethodInterfaces(), 0);
        } else this.error(`A method is already named "${name}"`);
    }

    removeMethod(name) {
        if (this.app.currentClass.currentMethod.name == name) this.app.currentClass.openMethod("Constructor");
        delete this.methods[name];
        this.app.refreshMethodInterfaces();
    }

    openMethod(name) {
        if (this.currentMethod) if (name == this.currentMethod.name) return;
        if (this.currentMethod) this.currentMethod.close();
        this.currentMethod = this.methods[name];
        this.currentMethod.open();
    }

    createVariable(name, value) {

    }

    removeVariable(name) {

    }
};
