class Manager {
    constructor(app) {
        this.app = app;
    }

    create(name, obj, type, call) {
        if (!Object.keys(obj).includes(name)) {
            if (call) call();
            this.app.error(`Successfully created ${type} "${name}"`);
            // setTimeout(() => this.app.refreshInterfaces(), 0);
        } else this.app.error(`A ${type} is already named "${name}"`);
    }
};
