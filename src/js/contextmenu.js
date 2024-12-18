class ContextMenu {
    constructor(app, { x, y }) {
        this.app = app;

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
            Object.entries(this.app.nodes).forEach(([id, node]) => {
                if (id <= 1) return;
                if (!node.title.toLowerCase().includes(e.target.value.toLowerCase())) return;
                const li = document.createElement("li");
                li.textContent = node.title;
                li.setAttribute("node-id", id);
                nodeList.appendChild(li);

                li.addEventListener("click", () => {
                    this.app.currentBlueprint.createNode(this.app.getCursorPos({ x: x, y: y }), id);
                    this.app.destroyContextMenu();
                });
            });
        });
        input.addEventListener("keydown", (e) => {
            if (e.key != "Enter") return;
            if (nodeList.children.length != 1) return;
            this.app.currentBlueprint.createNode(this.app.getCursorPos({ x: x, y: y }), [...nodeList.children][0].getAttribute("node-id"));
            this.app.destroyContextMenu();
        });

        input.dispatchEvent(new Event("input"));
    }

    destroy() {
        this.element.remove();
    }
};
