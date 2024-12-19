class ContextMenu {
    constructor(app, { x, y }) {
        this.app = app;
        this.x = x;
        this.y = y;

        this.nodes = this.getAllNodes();

        this.element = document.createElement("div");
        this.element.classList.add("contextmenu");
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
        document.body.appendChild(this.element);

        const input = document.createElement("input");
        this.element.appendChild(input);
        input.focus();

        const nodeList = document.createElement("ul");
        this.element.appendChild(nodeList);

        input.addEventListener("input", (e) => {
            nodeList.innerHTML = "";
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
                    this.app.currentClass.currentMethod.createNode(this.app.getCursorPos({ x: x, y: y }), id, data);
                    this.app.destroyContextMenu();
                });
            });
        });
        input.addEventListener("keydown", (e) => {
            if (e.key != "Enter") return;
            if (nodeList.children.length != 1) return;

            const li = [...nodeList.children][0];
            const nodeId = parseInt(li.getAttribute("node-id"));
            const data = (nodeId >= 100000) ? this.nodes.filter((n) => n[0] == nodeId)[0][1] : null;
            this.app.currentClass.currentMethod.createNode(this.app.getCursorPos({ x: x, y: y }), li.getAttribute("node-id"), data);
            this.app.destroyContextMenu();
        });

        input.dispatchEvent(new Event("input"));
        this.fixPosition();
    }

    getAllNodes() {
        const methods = [];
        const variables = [];

        function getNextId(ctx, methods, variables) {
            const min = 1000000;
            const ids = Object.keys(ctx.app.nodes).concat(methods.map((m) => m[0])).concat(variables.map((v) => v[0])).map((id) => Number(id)).filter((id) => id >= min);
            if (ids.length != 0) {
                const seen = new Set();
                for (const num of ids) if (num > min) seen.add(num);
                let i = min + 1;
                while (true) {
                    if (!seen.has(i)) return i;
                    i++;
                }
            } else return min;
        }

        Object.entries(this.app.classes).forEach(([className, classValue]) => {
            Object.keys(classValue.methods).forEach((name) => {
                if (name == "Constructor") return;
                methods.push([getNextId(this, methods, variables), {
                    title: name,
                    from: className,
                    parameters: [
                        { type: "execute", title: "" },
                    ],
                    returns: [
                        { type: "execute", title: "" },
                    ],
                }]);
            });
            Object.keys(classValue.variables).forEach((name) => {
                variables.push([getNextId(this, methods, variables), {
                    title: `Get ${name}`,
                    from: className,
                    parameters: [],
                    returns: [
                        { type: "variable", title: name },
                    ],
                }]);
                variables.push([getNextId(this, methods, variables), {
                    title: `Set ${name}`,
                    from: className,
                    parameters: [
                        { type: "execute", title: "" },
                        { type: "variable", title: "" },
                    ],
                    returns: [
                        { type: "execute", title: "" },
                        { type: "variable", title: name },
                    ],
                }]);
            });
        });

        return Object.entries(this.app.nodes).concat(methods).concat(variables);
    }

    destroy() {
        this.element.remove();
    }

    fixPosition() {
        const thisRect = this.element.getBoundingClientRect();
        const CBPCRect = this.app.elements.center.currentClassContainer.getBoundingClientRect();
        if (thisRect.x + thisRect.width > CBPCRect.x + CBPCRect.width) this.element.style.left = `${this.x - thisRect.width}px`;
        if (thisRect.y + thisRect.height > CBPCRect.y + CBPCRect.height) this.element.style.top = `${this.y - thisRect.height}px`;
    }
};
