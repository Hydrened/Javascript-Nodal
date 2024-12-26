class Events {
    constructor(app) {
        this.app = app;

        this.grid = {
            pos: { x: 0, y: 0 }, 
            click: null, 
        };

        this.handleEvents();
    }

    handleEvents() {
        this.left();
        this.right();
        this.center();

        document.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    left() {
        const left = this.app.interface.elements.left;
        left.classList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.createClass(this.app.getNextName(this.app.classes, "Class"));
        });
        left.variableList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.createVariable(this.app.getNextName(this.app.currentClass.variables, "Variable"));
        });
        left.methodList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.createMethod(this.app.getNextName(this.app.currentClass.methods, "Method"));
        });
        left.localVariableList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.currentMethod.createLocalVariable(this.app.getNextName(this.app.currentClass.currentMethod.localVariables, "Local variable"));
        });
    }

    right() {
        const right = this.app.interface.elements.right;
        right.classParameters.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.createParameter(this.app.getNextName(this.app.currentClass.parameters, "Class parameter"));
        });
        right.methodParameters.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.currentMethod.createParameter(this.app.getNextName(this.app.currentClass.currentMethod.parameters, "Method parameter"));
        });
        right.methodReturns.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.currentMethod.createReturn(this.app.getNextName(this.app.currentClass.currentMethod.returns, "Method return"));
        });
        right.methodPureCheckbox.addEventListener("change", (e) => this.app.currentClass.currentMethod.setPure(e.target.checked));
    }

    center() {
        const center = this.app.interface.elements.center;
        center.method.container.addEventListener("mousedown", (e) => {
            switch (e.button) {
                case 0: break;
                case 2:
                    if (!this.grid.click) {
                        const rect = this.app.interface.elements.center.method.container.getBoundingClientRect();
                        this.grid.click = { x: this.grid.pos.x - e.x + rect.x, y: this.grid.pos.y - e.y + rect.y };
                    }
                    break;
                default: break;
            }
        });
        center.method.container.addEventListener("mouseup", (e) => {
            switch (e.button) {
                case 0: break;
                case 2:
                    const click = this.getCursorPos(e);
                    center.method.container.classList.remove("moving");
                    this.grid.click = null;
                    break;
                default: break;
            }
        });
        center.method.container.addEventListener("mousemove", (e) => {
            if (!this.grid.click) return;
            center.method.container.classList.add("moving");
            
            const rect = this.app.interface.elements.center.method.container.getBoundingClientRect();
            this.grid.pos.x = e.x - rect.x + this.grid.click.x;
            this.grid.pos.y = e.y - rect.y + this.grid.click.y;
            document.documentElement.style.setProperty("--grid-pos-x", `${this.grid.pos.x}px`);
            document.documentElement.style.setProperty("--grid-pos-y", `${this.grid.pos.y}px`);
        });
    }

    getCursorPos(e) {
        const rect = this.app.interface.elements.center.method.container.getBoundingClientRect();
        const offset = {
            x: e.x - rect.x,
            y: e.y - rect.y,
        };
        return {
            x: offset.x - this.grid.pos.x,
            y: offset.y - this.grid.pos.y,
        }
    }
};
