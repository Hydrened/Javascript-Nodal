class Manager {
    constructor(app) {
        this.app = app;
    }

    create(values, name, exception, displayType, nodeTypesToUpdate, then) {
        if (!Array.isArray(values)) values = Object.keys(values);
        if (!values.includes(name)) {
            if (then) then();
            if (name != exception) this.app.success(`Successfully created ${displayType} "${name}"`);

            if (this.app.currentClass) {
                const method = this.app.currentClass.currentMethod;
                
                Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((m) => m.nodes.filter((node) => nodeTypesToUpdate.includes(node.data.type)).forEach((node) => {
                    const arr = (displayType.toLowerCase().includes("parameter")) ? node.data.parameters : node.data.returns;
                    arr.push({ title: name, type: "variable" });
                    method.getLinksByNodeUID(node.uid).forEach((link) => link.hide());
                    node.hide();
                })));

                method.refreshNodes();
                setTimeout(() => method.refreshLinks(), 200);
            }

            setTimeout(() => this.app.interface.refresh(), 0);
        } else this.app.error(`A ${displayType} is already named "${name}"`);
    }

    remove(values, nameToRemove, nodeTypesToRemove, linkersToRemove) {
        if (Array.isArray(values)) {
            const index = values.indexOf(nameToRemove);
            if (index != -1) values.splice(index, 1);
            else return false;
        } else delete values[nameToRemove];

        Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((method) => {
            method.nodes.forEach((node) => {
                if (linkersToRemove.includes(node.data.type)) {
                    node.data.parameters.forEach((par, index) => {
                        if (par.title == nameToRemove) node.data.parameters.splice(index, 1);
                    });
                    node.data.returns.forEach((ret, index) => {
                        if (ret.title == nameToRemove) node.data.returns.splice(index, 1);
                    });

                    method.getLinksByNodeUID(node.uid).forEach((link) => method.removeLink(link));
                    node.hide();
                }
                if (nodeTypesToRemove.includes(node.data.type)) method.removeNode(node);
            });
        }));

        this.app.currentClass.currentMethod.refreshNodes();
        setTimeout(() => this.app.currentClass.currentMethod.refreshLinks(), 200);
        this.app.interface.refresh();
        return true;
    }

    rename(values, oldName, newName, displayType, nodeTypesToRename) {
        const isArray = Array.isArray(values);
        if (oldName == newName || newName == "") return false;
        const arrCopy = (!isArray) ? Object.keys(values) : values;
        if (arrCopy.includes(newName)) return this.app.error(`${displayType} named "${newName}" already exist`);

        if (!isArray) {
            values[newName] = values[oldName];
            if (!displayType.toLowerCase().includes("variable")) values[newName].name = newName;
            delete values[oldName];
        } else values[values.indexOf(oldName)] = newName;

        Object.values(this.app.classes).forEach((c) => Object.values(c.methods).forEach((method) => method.nodes.filter((node) => nodeTypesToRename.includes(node.data.type)).forEach((node) => {
            node.data.title = node.data.title.replace(oldName, newName);
            node.data.parameters.filter((par) => par.title == oldName).forEach((par) => par.title = newName);
            node.data.returns.filter((ret) => ret.title == oldName).forEach((ret) => ret.title = newName);
            
            method.getLinksByNodeUID(node.uid).forEach((link) => link.hide());
            node.hide();
        })));
        
        this.app.currentClass.currentMethod.refreshNodes();
        setTimeout(() => this.app.currentClass.currentMethod.refreshLinks(), 200);
        this.app.interface.refresh();
        this.app.currentClass.openMethod(this.app.currentClass.currentMethod.name, true);
        return this.app.success(`Successfully renamed ${displayType.toLowerCase()} "${oldName}" to "${newName}"`);
    }
};
