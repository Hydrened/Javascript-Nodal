class Node {
    constructor(app, blueprint, data, pos, id) {
        this.app = app;
        this.blueprint = blueprint;
        this.data = data;
        this.pos = pos;
        this.id = id;
        this.uid = (this.blueprint.nodes.length == 0) ? 0 : this.blueprint.nodes.filter((node, index) => node.uid != index + 1).length;
        this.displayed = false;
        this.snap();

        this.element = null;
    }

    show() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.displayed = true;

        const isFunction = this.data.parameters.concat(this.data.returns).filter((v) => v.type == "execute").length > 0;

        this.element = document.createElement("div");
        this.element.classList.add("node");
        this.element.classList.add(isFunction ? "function" : "operation");
        this.updatePos();
        this.element.id = this.uid;
        this.element.setAttribute("node-id", this.id);
        this.app.elements.center.nodeContainer.appendChild(this.element);
        
        const header = document.createElement("header");
        header.textContent = this.data.title;
        this.element.appendChild(header);

        const inputContainer = document.createElement("ul");
        inputContainer.classList.add("input-container");
        this.element.appendChild(inputContainer);

        const outputContainer = document.createElement("ul");
        outputContainer.classList.add("output-container");
        this.element.appendChild(outputContainer);

        function createLi(v, parent, isIpnut) {
            const li = document.createElement("li");
            parent.appendChild(li);

            const connector = document.createElement("div");
            connector.classList.add("connector");
            connector.classList.add(v.type);
            li.appendChild(connector);

            const title = document.createElement("p");
            title.textContent = v.title;
            li.appendChild(title);

            if (!isIpnut || v.type != "variable") return;
            const input = document.createElement("input");
            li.appendChild(input);
        }

        this.data.parameters.forEach((param) => createLi(param, inputContainer, true));
        this.data.returns.forEach((ret) => createLi(ret, outputContainer, false));
    }

    hide() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.displayed = false;
    }

    snap() {
        const snap = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--main-grid-size").slice(0, -2)) / parseInt(getComputedStyle(document.documentElement).getPropertyValue("--main-grid-units"));
        this.pos.x = parseInt(this.pos.x / snap) * snap;
        this.pos.y = parseInt(this.pos.y / snap) * snap;
    }

    updatePos() {
        this.element.style.top = `${this.pos.y}px`;
        this.element.style.left = `${this.pos.x}px`;
    }
};
