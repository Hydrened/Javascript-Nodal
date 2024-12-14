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
    }

    show() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.displayed = true;

        const node = document.createElement("div");
        node.classList.add("node");
        node.style.top = `${this.pos.y}px`;
        node.style.left = `${this.pos.x}px`;
        node.id = this.uid;
        node.setAttribute("node-id", this.id);
        this.app.elements.center.nodeContainer.appendChild(node);
        
        const isFunction = this.data.parameters.concat(this.data.returns).filter((v) => v.type == "execute").length > 0;
        if (isFunction) {
            const header = document.createElement("header");
            header.textContent = this.data.title;
            node.appendChild(header);
        }        


        console.log(node);
    }

    hide() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.displayed = false;
    }

    snap() {
        this.pos.x = parseInt(this.pos.x / 8) * 8;
        this.pos.y = parseInt(this.pos.y / 8) * 8;
    }
};
