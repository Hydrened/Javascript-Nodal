class Manager {
    constructor(app) {
        this.app = app;
    }

    create(array, name, exception, displayType, nodeTypes, then) {
        if (!Array.isArray(array)) array = Object.keys(array);
        if (!array.includes(name)) {
            if (then) then();
            if (name != exception) this.app.success(`Successfully created ${displayType} "${name}"`);

            if (this.app.currentClass) {
                const method = this.app.currentClass.currentMethod;
                
                if (nodeTypes) Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((m) => m.nodes.filter((node) => nodeTypes.includes(node.data.type)).forEach((node) => {
                    const isParameter = displayType.toLowerCase().includes("parameter");
                    if (isParameter) {
                        node.data.parameters.push({
                            title: name,
                            type: "variable",
                        });
                    } else {

                    }
                    method.getLinksByNodeUID(node.uid).forEach((link) => link.hide());
                    node.hide();
                })));

                method.refreshNodes();
                setTimeout(() => method.refreshLinks(), 200);
            }

            setTimeout(() => this.app.interface.refresh(), 0);
        } else this.app.error(`A ${displayType} is already named "${name}"`);
    }

    remove(array, name, nodeTypes) {
        if (Array.isArray(array)) array.splice(array.indexOf(name), 1);
        else delete array[name];

        Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((method) => {
            method.nodes.filter((node) => nodeTypes.includes(node.data.type)).forEach((node) => method.removeNode(node));
            
        }));

        this.app.interface.refresh();
    }

    rename(array, oldName, newName, displayType, nodeTypes) {
        const isArray = Array.isArray(array);
        if (oldName == newName || newName == "") return;
        const arrCopy = (!isArray) ? Object.keys(array) : array;
        if (arrCopy.includes(newName)) return this.app.error(`${displayType} named "${newName}" already exist`);

        if (!isArray) {
            array[newName] = array[oldName];
            if (!displayType.toLowerCase().includes("variable")) array[newName].name = newName;
            delete array[oldName];
        } else array[array.indexOf(oldName)] = newName;

        Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((method) => method.nodes.filter((node) => nodeTypes.includes(node.data.type)).forEach((node) => {
            node.data.title = node.data.title.replace(oldName, newName);
            node.data.returns.at(-1).title = node.data.returns.at(-1).title.replace(oldName, newName);
            node.hide();
        })));
        this.app.currentClass.currentMethod.refreshNodes();

        this.app.currentClass.openMethod(this.app.currentClass.currentMethod.name, true);
        this.app.interface.refresh();
        return this.app.success(`Successfully renamed ${displayType.toLowerCase()} "${oldName}" to "${newName}"`);
    }
};
