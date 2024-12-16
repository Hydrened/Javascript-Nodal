class Link {
    constructor(app, blueprint, data) {
        this.app = app;
        this.blueprint = blueprint;
        this.data = data;
        this.displayed = false;
        this.uid = (this.blueprint.links.length == 0) ? 0 : this.blueprint.links.filter((link, index) => link.uid != index + 1).length;
        this.element = null;
    }

    show() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.displayed = true;

        const returnNode = this.blueprint.nodes.filter((node) => node.uid == this.data.returnNode.uid)[0];
        const parameterNode = this.blueprint.nodes.filter((node) => node.uid == this.data.parameterNode.uid)[0];

        const returnLink = returnNode.element.querySelector("ul.output-container").children[this.data.returnNode.index].querySelector("div.linker");
        const parameterLink = parameterNode.element.querySelector("ul.input-container").children[this.data.parameterNode.index].querySelector("div.linker");

        const retRect = returnLink.getBoundingClientRect();
        const parRect = parameterLink.getBoundingClientRect();

        const returnX = returnNode.pos.x + returnLink.offsetLeft + retRect.width / 2;
        const returnY = returnNode.pos.y + returnLink.offsetTop + retRect.height / 2;

        const parameterX = parameterNode.pos.x + parameterLink.offsetLeft + parRect.width / 2;
        const parameterY = parameterNode.pos.y + parameterLink.offsetTop + parRect.height / 2;

        const xDiff = Math.abs(returnX - parameterX);
        const yDiff = Math.abs(returnY - parameterY);

        const pos = {
            x: xDiff / 2 + Math.min(returnX, parameterX),
            y: yDiff / 2 + Math.min(returnY, parameterY),
        };

        const width = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        const angle = Math.atan2(yDiff, xDiff) * (180 / Math.PI) * ((returnY > parameterY) ? -1 : 1) * ((returnX > parameterX) ? -1 : 1);

        returnLink.classList.add("linked");
        parameterLink.classList.add("linked");
        
        this.element = document.createElement("div");
        this.element.classList.add("link");
        this.element.classList.add(returnNode.data.returns[this.data.returnNode.index].type);
        this.element.style.width = `${width}px`;
        this.element.style.top = `${pos.y}px`;
        this.element.style.left = `${pos.x - width / 2}px`;
        this.element.style.rotate = `${angle}deg`;
        this.app.elements.center.nodeContainer.appendChild(this.element);
    }

    hide() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.element.remove();
        this.displayed = false;
    }
};
