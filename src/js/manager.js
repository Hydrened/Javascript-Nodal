class Manager {
    constructor(app) {
        this.app = app;
    }

    create(array, name, type, then) {
        if (!Array.isArray(array)) array = Object.keys(array);
        if (!array.includes(name)) {
            if (then) then();
            this.app.success(`Successfully created ${type} "${name}"`);
            setTimeout(() => this.app.interface.refresh(), 0);
        } else this.app.error(`A ${type} is already named "${name}"`);
    }

    remove(array, name) {
        if (Array.isArray(array)) array.splice(array.indexOf(name), 1);
        else delete array[name];
        // node suppresion
        this.app.interface.refresh();
    }

    rename(array, oldName, newName, type) {
        const isArray = Array.isArray(array);
        if (oldName == newName || newName == "") return;
        const arrCopy = (!isArray) ? Object.keys(array) : array;
        if (arrCopy.includes(newName)) return this.app.error(`${type} named "${newName}" already exist`);

        if (!isArray) {
            array[newName] = array[oldName];
            if (!type.toLowerCase().includes("variable")) array[newName].name = newName;
            delete array[oldName];
        } else array[array.indexOf(oldName)] = newName;

        // node update

        this.app.currentClass.openMethod(this.app.currentClass.currentMethod.name, true);
        this.app.interface.refresh();
        return this.app.success(`Successfully renamed ${type.toLowerCase()} "${oldName}" to "${newName}"`);
    }
};
