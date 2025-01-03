class NodeMenu {
    constructor(app, pos) {
        this.app = app;
        this.pos = pos;

        this.nodes = this.getAllNodes();

        this.element = document.createElement("div");
        this.element.classList.add("node-menu");
        this.element.style.top = `${this.pos.y}px`;
        this.element.style.left = `${this.pos.x}px`;
        document.body.appendChild(this.element);

        const input = document.createElement("input");
        this.element.appendChild(input);
        input.focus();

        const nodeList = document.createElement("ul");
        this.element.appendChild(nodeList);

        input.addEventListener("input", (e) => {
            removeChildren(nodeList);
            this.nodes.forEach(([id, data]) => {
                if (id <= 1) return;
                if (!data.title.toLowerCase().includes(e.target.value.toLowerCase()) && !data.from.toLowerCase().includes(e.target.value.toLowerCase())) return;

                const li = document.createElement("li");
                li.textContent = data.title;
                li.setAttribute("node-id", id);
                nodeList.appendChild(li);

                if (data.from != "") {
                    const span = document.createElement("span");
                    span.textContent = `from ${data.from}`;
                    li.appendChild(span);
                }

                li.addEventListener("click", () => {
                    this.app.currentClass.currentMethod.createNode(this.app.events.getCursorPos(this.pos), id, data);
                    this.app.destroyNodeMenu(); 
                });
            });
        });
        input.addEventListener("keydown", (e) => {
            if (e.key != "Enter") return;
            if (nodeList.children.length != 1) return;

            const li = [...nodeList.children][0];
            const nodeId = parseInt(li.getAttribute("node-id"));
            const data = (nodeId >= 100000) ? this.nodes.filter((n) => n[0] == nodeId)[0][1] : null;
            this.app.currentClass.currentMethod.createNode(this.app.events.getCursorPos(this.pos), li.getAttribute("node-id"), data);
            this.app.destroyNodeMenu(); 
        });

        input.dispatchEvent(new Event("input"));
        this.fixPosition();
    }

    getAllNodes() {
        function getNextId(ids) {
            const min = 1000000;
            if (ids.length != 0) for (let i = 0; i < ids.length; i++) {
                if (parseInt(ids[i]) != i + min) return String(i + min);
                return String(parseInt(ids.at(-1)) + 1);
            } else return String(min); 
        }

        function addVariable(nodes, name, from, type) {
            nodes.push([getNextId(nodes.map((n) => n[0])), {
                title: `Get ${name}`,
                from: from,
                type: type,
                parameters: [],
                returns: [{ type: "variable", title: name }],
            }]);
            nodes.push([getNextId(nodes.map((n) => n[0])), {
                title: `Set ${name}`,
                from: from,
                type: type,
                parameters: [
                    { type: "execute", title: "" },
                    { type: "variable", title: "" },
                ],
                returns: [
                    { type: "execute", title: "" },
                    { type: "variable", title: name },
                ],
            }]);
        }

        const nodes = [];

        Object.entries(this.app.classes).forEach(([className, classValue]) => {
            const classParameters = classValue.parameters.map((p) => { return { type: "variable", title: p }; });

            // INSTANCES OF ALL CLASSES
            if (className != "Main") nodes.push([getNextId(nodes.map((n) => n[0])), {
                title: `New Instance of ${className}`,
                from: "",
                type: "new instance",
                parameters: [{ type: "execute", title: "" }].concat(classParameters),
                returns: [
                    { type: "execute", title: "" },
                    { type: "variable", title: "Instance" },
                ],
            }]);

            const currentClassName = this.app.currentClass.name;
            
            Object.entries(classValue.methods).forEach(([methodName, methodValue]) => {
                const methodParameters = methodValue.parameters.map((p) => { return { type: "variable", title: p }; });
                const methodReturns = methodValue.returns.map((r) => { return { type: "variable", title: r }; });

                // ALL CLASSES METHODS
                if (methodName != "Constructor") nodes.push([getNextId(nodes.map((n) => n[0])), {
                    title: methodName,
                    from: className,
                    type: "method",
                    parameters: (methodValue.pure) ? methodParameters : [{ type: "execute", title: "" }].concat(methodParameters),
                    returns: (methodValue.pure) ? methodReturns : [{ type: "execute", title: "" }].concat(methodReturns),
                }]);

                const currentMethodName = this.app.currentClass.currentMethod.name;
                if (methodName == currentMethodName && className == currentClassName) {
                    // ALL CURRENT METHOD PARAMETERS
                    if (methodName != "Constructor") methodValue.parameters.forEach((p) => {
                        addVariable(nodes, p, currentMethodName, "method parameter");
                    });

                    // ALL CURRENT METHOD LOCAL VARIABLES
                    Object.entries(methodValue.localVariables).forEach(([localVariableName, localVariableValue]) => {
                        addVariable(nodes, localVariableName, currentMethodName, "local variable");
                    });
                }
            });

            if (className == currentClassName) {
                // ALL CURRENT CLASS PARAMETERS
                this.app.currentClass.parameters.forEach((p) => {
                    addVariable(nodes, p, className, "class parameter");
                });

                // ALL CURRENT CLASS VARIABLES
                Object.entries(classValue.variables).forEach(([variableName, variableValue]) => {
                    addVariable(nodes, variableName, className, "class variable");
                });
            }
        });

        return Object.entries(this.app.nodes).concat(nodes);
    }

    destroy() {
        this.element.remove();
    }

    fixPosition() {
        const thisRect = this.element.getBoundingClientRect();
        const containerRect = this.app.interface.elements.center.method.container.getBoundingClientRect();
        if (thisRect.x + thisRect.width > containerRect.x + containerRect.width) this.element.style.left = `${this.pos.x - thisRect.width}px`;
        if (thisRect.y + thisRect.height > containerRect.y + containerRect.height) this.element.style.top = `${this.pos.y - thisRect.height}px`;
    }
};
