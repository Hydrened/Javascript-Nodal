class Interface {
    constructor(app) {
        this.app = app;
    }

    refresh() {
        this.reset();

        this.refreshTabs({
            titles: Object.keys(this.app.classes),
            exception: this.app.currentClass.name,
            parent: this.app.elements.center.classTabs,
            calls: {
                click: (name) => this.app.openClass(name),
            },
        });
        this.refreshTabs({
            titles: Object.keys(this.app.currentClass.methods),
            exception: this.app.currentClass.currentMethod.name,
            parent: this.app.elements.center.classMethodTabs,
            calls: {
                click: (name) => this.app.currentClass.openMethod(name),
            },
        });

        this.refreshLeft();
    }

    reset() {
        this.app.elements.center.classTabs.innerHTML = "";
        this.app.elements.left.classList.innerHTML = "";
        this.app.elements.center.classMethodTabs.innerHTML = "";
        this.app.elements.left.methodList.innerHTML = "";
        this.app.elements.left.variableList.innerHTML = "";
        this.app.elements.left.localVariableList.innerHTML = "";
    }

    refreshTabs({ titles, exception, parent, calls: { click } }) {
        titles.forEach((name) => {
            const li = document.createElement("li");
            if (name == exception) li.classList.add("on");
            parent.appendChild(li);

            const title = document.createElement("h5");
            title.textContent = name;
            li.appendChild(title);

            li.addEventListener("click", () => {
                if (exception == name) return;
                click(name);
                this.app.refreshInterfaces();
            });
        });
    }

    refreshLeft() {
        this.refreshLeftList({
            titles: Object.keys(this.app.classes),
            exception: "Main",
            parent: this.app.elements.left.classList,
            calls: {
                rename: (oldName, newName) => this.app.renameClass(oldName, newName),
                open: (name) => this.app.openClass(name),
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
        this.refreshLeftList({
            titles: Object.keys(this.app.currentClass.methods),
            exception: "Constructor",
            parent: this.app.elements.left.methodList,
            calls: {
                rename: (oldName, newName) => this.app.currentClass.renameMethod(oldName, newName),
                open: (name) => this.app.currentClass.openMethod(name),
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove method "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.removeMethod(name);
                            this.app.success(`Successfully removed method "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        this.refreshLeftList({
            titles: Object.keys(this.app.currentClass.variables),
            exception: null,
            parent: this.app.elements.left.variableList,
            calls: {
                rename: (oldName, newName) => this.app.currentClass.renameVariable(oldName, newName),
                open: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove variable "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.removeVariable(name);
                            this.app.success(`Successfully removed variable "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        this.refreshLeftList({
            titles: Object.keys(this.app.currentClass.currentMethod.localVariables),
            exception: null,
            parent: this.app.elements.left.localVariableList,
            calls: {
                rename: (oldName, newName) => this.app.currentClass.currentMethod.renameLocalVariable(oldName, newName),
                open: null,
                confirmRemove: {
                    message: (name) => `Are you sure you wan to remove local variable "${name}"?`,
                    options: (name) => [
                        { button: "Yes", call: () => {
                            this.app.currentClass.currentMethod.removeLocalVariable(name);
                            this.app.success(`Successfully removed local variable "${name}"`);
                        }},
                        { button: "Cancel", call: null },
                    ],
                }
            },
        });
        
        this.app.elements.left.currentClass.textContent = this.app.currentClass.name;
    }

    refreshLeftList({ titles, exception, parent, calls: { rename, open, confirmRemove } }) {
        titles.forEach((name) => {
            const li = document.createElement("li");
            if (open && name != exception) li.classList.add("can-click");
            parent.appendChild(li);

            const input = document.createElement("input");
            input.value = name;
            input.setAttribute("readonly", "readonly");
            li.appendChild(input);

            let clickTimeout = null;
            if (name != exception) input.addEventListener("dblclick", () => {
                clearTimeout(clickTimeout);
                clickTimeout = null;
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
                const oldName = titles[[...parent.children].map((li) => li.querySelector("input:not(:read-only)")).indexOf(input)];
                input.setAttribute("readonly", "readonly");
                if (rename && oldName != undefined) if (!rename(oldName, input.value)) input.value = oldName;
                
            });

            li.addEventListener("click", () => {
                if (clickTimeout) return;
                clickTimeout = setTimeout(() => {
                    clickTimeout = null;
                    // if (open) open(name);
                }, 250);
            });

            const cross = document.createElement("button");
            cross.classList.add("cross");
            cross.textContent = "+";
            if (name == exception) cross.classList.add("disabled");
            li.appendChild(cross);

            if (name != exception) cross.addEventListener("click", () => new Confirm(confirmRemove.message(name), confirmRemove.options(name)));
        });
    }
};
