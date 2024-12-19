class Node {
    constructor(app, c, method, data, pos, id) {
        this.app = app;
        this.class = c;
        this.method = method;
        this.data = data;
        this.pos = pos;
        this.id = Number(id);
        this.uid = this.method.getNextNodeUID();
        this.displayed = false;
        this.element = null;
        this.snap();
    }

    show() {
        if (!this.app.isCurrentBP(this.class)) return;
        this.displayed = true;

        const isFunction = this.data.parameters.concat(this.data.returns).filter((v) => v.type == "execute").length > 0;

        this.element = document.createElement("div");
        this.element.classList.add("node");
        this.element.classList.add(isFunction ? "function" : "pure");
        this.updatePos();
        this.element.id = this.uid;
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

        function createLi(v, parent, isParameter) {
            const li = document.createElement("li");
            parent.appendChild(li);

            const linker = document.createElement("div");
            linker.classList.add("linker");
            linker.classList.add(v.type);
            li.appendChild(linker);

            const title = document.createElement("p");
            title.textContent = v.title;
            li.appendChild(title);

            if (!isParameter || v.type != "variable") return;
            const input = document.createElement("input");
            li.appendChild(input);
        }

        this.data.parameters.forEach((param) => createLi(param, inputContainer, true));
        this.data.returns.forEach((ret) => createLi(ret, outputContainer, false));
    }

    hide() {
        if (!this.app.isCurrentBP(this.class)) return;
        this.element.remove();
        this.displayed = false;
    }

    snap() {
        const snap = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--main-grid-size").slice(0, -2)) / parseInt(getComputedStyle(document.documentElement).getPropertyValue("--main-grid-units"));
        this.pos.x = Math.round(this.pos.x / snap) * snap;
        this.pos.y = Math.round(this.pos.y / snap) * snap;
    }

    updatePos() {
        this.element.style.top = `${this.pos.y}px`;
        this.element.style.left = `${this.pos.x}px`;
    }
};
