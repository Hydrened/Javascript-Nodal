class Interface {
    constructor(app) {
        this.app = app;

        this.elements = {
            left: {
                currentClassTitle: document.getElementById("current-class-title"),
                currentMethodTitle: document.getElementById("current-method-title"),
                classList: document.getElementById("class-list-container"),
                methodList: document.getElementById("method-list-container"),
                variableList: document.getElementById("variable-list-container"),
                localVariableList: document.getElementById("local-variable-list-container"),
            },
            right: {
                classParameters: document.getElementById("current-class-parameters-container"),
                classVariables: document.getElementById("current-class-variables-container"),
                methodParameters: document.getElementById("current-method-parameters-container"),
                methodReturns: document.getElementById("current-method-returns-container"),
                methodVariables: document.getElementById("current-method-variables-container"),
                methodPureCheckbox: document.getElementById("current-method-pure-checkbox"),
            },
            center: {
                path: document.getElementById("path"),
                methodName: document.getElementById("current-class-method-name"),
                method: {
                    container: document.getElementById("current-method"),
                    nodeContainer: document.getElementById("node-container"),
                }
            },
        };
    }

    refresh() {
        this.refreshLeft();
        this.refreshRight();
        this.refreshCenter();
    }

    refreshLeft() {
        if (!this.app.currentClass) return;
        const left = this.elements.left;
        left.currentClassTitle.textContent = this.app.currentClass.name;
        left.currentMethodTitle.textContent = this.app.currentClass.currentMethod.name;

        removeChildren(left.classList);
        removeChildren(left.methodList);
        removeChildren(left.variableList);
        removeChildren(left.localVariableList);

        this.refreshList({
            entries: Object.keys(this.app.classes),
            current: this.app.currentClass.name,
            exception: "Main",
            parent: left.classList,
            calls: {
                change: (oldName, newName) => this.app.renameClass(oldName, newName),
                click: (name) => this.app.openClass(name),
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove class "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.removeClass(name);
                            this.app.success(`Successfully removed class "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        this.refreshList({
            entries: Object.keys(this.app.currentClass.methods),
            current: this.app.currentClass.currentMethod.name,
            exception: "Constructor",
            parent: left.methodList,
            calls: {
                change: (oldName, newName) => this.app.currentClass.renameMethod(oldName, newName),
                click: (name) => this.app.currentClass.openMethod(name),
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove method "${name}" from ${this.app.currentClass.name}?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.removeMethod(name);
                            this.app.success(`Successfully removed method "${name}" from ${this.app.currentClass.name}`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        this.refreshList({
            entries: Object.keys(this.app.currentClass.variables),
            current: null,
            exception: null,
            parent: left.variableList,
            calls: {
                change: (oldName, newName) => this.app.currentClass.renameVariable(oldName, newName),
                click: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove variable "${name}" from ${this.app.currentClass.name}?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.removeVariable(name);
                            this.app.success(`Successfully removed variable "${name}" from ${this.app.currentClass.name}`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        this.refreshList({
            entries: Object.keys(this.app.currentClass.currentMethod.localVariables),
            current: null,
            exception: null,
            parent: left.localVariableList,
            calls: {
                change: (oldName, newName) => this.app.currentClass.currentMethod.renameLocalVariable(oldName, newName),
                click: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove local variable "${name}" from ${this.app.currentClass.currentMethod.name}?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.currentMethod.removeLocalVariable(name);
                            this.app.success(`Successfully removed local variable "${name}" from ${this.app.currentClass.currentMethod.name}`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
    }

    refreshRight() {
        if (!this.app.currentClass) return;
        const right = this.elements.right;

        removeChildren(right.classParameters);
        removeChildren(right.classVariables);
        removeChildren(right.methodParameters);
        removeChildren(right.methodReturns);
        removeChildren(right.methodVariables);
        right.methodPureCheckbox.removeAttribute("disabled");

        if (this.app.currentClass.currentMethod.name == "Constructor") right.methodPureCheckbox.setAttribute("disabled", "disabled");
        right.methodPureCheckbox.checked = this.app.currentClass.currentMethod.pure;

        this.refreshList({
            entries: this.app.currentClass.parameters,
            current: null,
            exception: null,
            parent: right.classParameters,
            calls: {
                change: (oldName, newName) => this.app.currentClass.renameParameter(oldName, newName),
                click: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove class parameter "${name}" from ${this.app.currentClass.name}?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.removeParameter(name);
                            this.app.success(`Successfully removed class parameter "${name}" from ${this.app.currentClass.name}`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                },
            },
        });
        this.refreshList({
            entries: Object.entries(this.app.currentClass.variables),
            current: null,
            exception: null,
            parent: right.classVariables,
            calls: {
                change: (oldName, newName) => this.app.currentClass.setVariableValue(oldName, newName),
                click: null,
                confirmRemove: null,
            },
        });

        this.refreshList({
            entries: this.app.currentClass.currentMethod.parameters,
            current: null,
            exception: null,
            parent: right.methodParameters,
            calls: {
                change: (oldName, newName) => this.app.currentClass.currentMethod.renameParameter(oldName, newName),
                click: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove method parameter "${name}" from ${this.app.currentClass.currentMethod.name}?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.currentMethod.removeParameter(name);
                            this.app.success(`Successfully removed method parameter "${name}" from ${this.app.currentClass.currentMethod.name}`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                },
            },
        });
        this.refreshList({
            entries: this.app.currentClass.currentMethod.returns,
            current: null,
            exception: null,
            parent: right.methodReturns,
            calls: {
                change: (oldName, newName) => this.app.currentClass.currentMethod.renameReturn(oldName, newName),
                click: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove method return "${name}" from ${this.app.currentClass.currentMethod.name}?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.currentMethod.removeReturn(name);
                            this.app.success(`Successfully removed method return "${name}" from ${this.app.currentClass.currentMethod.name}`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                },
            },
        });
        this.refreshList({
            entries: Object.entries(this.app.currentClass.currentMethod.localVariables),
            current: null,
            exception: null,
            parent: right.methodVariables,
            calls: {
                change: (oldName, newName) => this.app.currentClass.currentMethod.setLocalVariableValue(oldName, newName),
                click: null,
                confirmRemove: null,
            },
        });
    }

    refreshCenter() {
        if (!this.app.currentClass) return;
        const center = this.elements.center;
        center.methodName.textContent = this.app.currentClass.currentMethod.name;

        removeChildren(center.path);

        [this.app.currentClass.name, this.app.currentClass.currentMethod.name].forEach((t) => {
            const title = document.createElement("p");
            title.textContent = t;
            center.path.appendChild(title);
        });
    }

    refreshList({ entries, current, exception, parent, calls: { change, click, confirmRemove } }) {
        entries.forEach((entry) => {
            const isArray = Array.isArray(entry);
            const name = isArray ? entry[0] : entry; 
            const value = isArray ? entry[1] : entry; 
            
            const li = document.createElement("li");
            if (click) li.classList.add("can-click");
            parent.appendChild(li);

            if (isArray) {
                const label = document.createElement("p");
                label.textContent = name;
                li.appendChild(label);
            }

            const input = document.createElement("input");
            input.value = isArray ? value : name;
            if (click) input.setAttribute("readonly", "readonly");
            if (current == name) input.classList.add("current");
            if (exception == name) input.classList.add("read-only");
            li.appendChild(input);

            if (name != exception && click) input.addEventListener("dblclick", () => {
                input.removeAttribute("readonly");
                input.select();
            });

            if (name != exception) input.addEventListener("keydown", (e) => {
                if (e.key == "Enter") {
                    input.setSelectionRange(0, 0);
                    input.blur();
                }
            });
            if (name != exception) input.addEventListener("blur", () => {
                const tempOldName = entries[[...parent.children].map((li) => li.querySelector("input:not(:read-only)")).indexOf(input)];
                if (!tempOldName) return;
                const oldName = isArray ? tempOldName[0] : tempOldName;
                if (click) input.setAttribute("readonly", "readonly");
                if (change && oldName != undefined) if (!change(oldName, input.value)) input.value = oldName;
            });

            if (click) li.addEventListener("click", (e) => {
                if (e.target == li) click(name);
            });

            if (confirmRemove) {
                const cross = document.createElement("button");
                cross.classList.add("cross");
                cross.textContent = "+";
                if (name == exception) cross.classList.add("disabled");
                li.appendChild(cross);

                if (name != exception) cross.addEventListener("click", () => new Confirm(confirmRemove.message(name), confirmRemove.options(name)));
            }
        });
    }
};
