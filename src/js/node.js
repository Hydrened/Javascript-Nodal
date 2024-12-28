class Node {
    constructor(app, c, method, data, pos, id) {
        this.app = app;
        this.class = c;
        this.method = method;
        this.data = data;
        this.pos = pos;
        this.id = Number(id);

        this.uid = this.app.getNextUID(method.nodes.map((n) => n.uid));
        this.pure = this.data.parameters.concat(this.data.returns).filter((v) => v.type == "execute").length == 0;
        this.displayed = false;
        this.element = null;
        this.snap();
    }

    show() {
        if (this.app.currentClass.currentMethod != this.method) return;
        this.displayed = true;

        this.element = document.createElement("div");
        this.element.classList.add("node");
        this.element.classList.add(this.pure ? "pure" : "function");
        this.updatePos();
        this.element.id = this.uid;
        this.app.interface.elements.center.method.nodeContainer.appendChild(this.element);

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
        if (this.app.currentClass.currentMethod != this.method) return;
        this.element.classList.add("hide");
        this.displayed = false;
        setTimeout(() => this.element.remove(), 100);
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

    getRect() {
        const rect = this.element.getBoundingClientRect();
        return {
            x: this.pos.x,
            y: this.pos.y,
            width: rect.width,
            height: rect.height,
        };
    }
};
