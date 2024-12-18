class ContextMenu {
    constructor(app, { x, y }) {
        this.app = app;
        this.x = x;
        this.y = y;

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

            const methods = [];
            Object.values(this.app.classes).forEach((c, bpIndex) => {
                Object.keys(c.methods).forEach((methodName, mIndex) => {
                    if (methodName == "Constructor") return;
                    methods.push([String(100000 * (bpIndex + 1) + mIndex), {
                        title: methodName,
                        parameters: [
                            {
                                type: "execute",
                                title: "",
                            },
                        ],
                        returns: [
                            {
                                type: "execute",
                                title: "",
                            },
                        ],
                    }]);
                });
            });

            Object.entries(this.app.nodes).concat(methods).forEach(([id, data]) => {
                if (id <= 1) return;
                if (!data.title.toLowerCase().includes(e.target.value.toLowerCase())) return;

                const li = document.createElement("li");
                li.textContent = data.title;
                li.setAttribute("node-id", id);
                nodeList.appendChild(li);

                li.addEventListener("click", () => {
                    this.app.currentClass.currentMethod.createNode(this.app.getCursorPos({ x: x, y: y }), id, data);
                    this.app.destroyContextMenu();
                });
            });
        });
        input.addEventListener("keydown", (e) => {
            if (e.key != "Enter") return;
            if (nodeList.children.length != 1) return;
            this.app.currentClass.currentMethod.createNode(this.app.getCursorPos({ x: x, y: y }), [...nodeList.children][0].getAttribute("node-id"));
            this.app.destroyContextMenu();
        });

        input.dispatchEvent(new Event("input"));
        this.fixPosition();
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
