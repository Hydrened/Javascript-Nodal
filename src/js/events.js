class Events {
    constructor(app) {
        this.app = app;
        this.handleEvents();
    }

    handleEvents() {
        this.left();
        this.right();
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
    }
};
