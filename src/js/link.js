class Link {
    constructor(app, blueprint, data) {
        this.app = app;
        this.blueprint = blueprint;
        this.data = data;
        this.displayed = false;
        this.uid = this.app.getNextLinkUID(blueprint);
        this.element = null;
        this.returnLink = null;
        this.parameterLink = null;
    }

    show() {
        if (!this.app.isCurrentBP(this.blueprint)) return;
        this.displayed = true;

        const returnNode = this.blueprint.nodes.filter((node) => node.uid == this.data.returnNode.uid)[0];
        const parameterNode = this.blueprint.nodes.filter((node) => node.uid == this.data.parameterNode.uid)[0];

        this.returnLink = returnNode.element.querySelector("ul.output-container").children[this.data.returnNode.index].querySelector("div.linker");
        this.parameterLink = parameterNode.element.querySelector("ul.input-container").children[this.data.parameterNode.index].querySelector("div.linker");

        const retRect = this.returnLink.getBoundingClientRect();
        const parRect = this.parameterLink.getBoundingClientRect();

        const returnX = returnNode.pos.x + this.returnLink.offsetLeft + retRect.width / 2;
        const returnY = returnNode.pos.y + this.returnLink.offsetTop + retRect.height / 2;

        const parameterX = parameterNode.pos.x + this.parameterLink.offsetLeft + parRect.width / 2;
        const parameterY = parameterNode.pos.y + this.parameterLink.offsetTop + parRect.height / 2;

        const xDiff = Math.abs(returnX - parameterX);
        const yDiff = Math.abs(returnY - parameterY);

        const pos = {
            x: xDiff / 2 + Math.min(returnX, parameterX),
            y: yDiff / 2 + Math.min(returnY, parameterY),
        };

        const width = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        const angle = Math.atan2(yDiff, xDiff) * (180 / Math.PI) * ((returnY > parameterY) ? -1 : 1) * ((returnX > parameterX) ? -1 : 1);

        this.returnLink.classList.add("linked");
        this.parameterLink.classList.add("linked");
        
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
        if (this.element) this.element.remove();
        if (this.returnLink) if (this.app.getLinkerNbLinks(this.returnLink) == 0) this.returnLink.classList.remove("linked");
        if (this.parameterLink) if (this.app.getLinkerNbLinks(this.parameterLink) == 0) this.parameterLink.classList.remove("linked");
        this.displayed = false;
    }
};
