class Tabs {
    constructor(app) {
        this.app = app;

        this.elements = [];
    }

    create(method) {
        const tab = document.createElement("li");
        this.app.elements.center.tabContainer.appendChild(tab);

        const t = document.createElement("p");
        t.textContent = method.name;
        tab.appendChild(t);

        const f = document.createElement("span");
        f.textContent = ` from ${method.class.name}`;
        t.appendChild(f);

        const cross = document.createElement("button");
        cross.classList.add("cross");
        cross.textContent = "+";
        tab.appendChild(cross);

        cross.addEventListener("click", () => this.destroy(tab));
    }

    destroy(tab) {
        tab.remove();
    }
};
