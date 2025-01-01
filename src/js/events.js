class Events {
    constructor(app) {
        this.app = app;

        this.grid = {
            pos: { x: 128, y: 128 }, 
            click: null, 
            button: null,
            moved: false,
        };
        this.zone = null;
        this.held = [];
        this.linker = null;

        this.handleEvents();
    }

    handleEvents() {
        this.left();
        this.right();
        this.center();

        document.addEventListener("contextmenu", (e) => e.preventDefault());

        document.addEventListener("keydown", (e) => {
            const root = getComputedStyle(document.documentElement);
            const secondaryGridSize = parseFloat(root.getPropertyValue("--main-grid-size").slice(0, -2)) / root.getPropertyValue("--main-grid-units");

            switch (e.key) {
                case "Escape": this.app.destroyNodeMenu(); break;
                case "ArrowUp": this.app.currentClass.currentMethod.moveFocusedNodes({ x: 0, y: -secondaryGridSize }); break;
                case "ArrowDown": this.app.currentClass.currentMethod.moveFocusedNodes({ x: 0, y: secondaryGridSize }); break;
                case "ArrowLeft": this.app.currentClass.currentMethod.moveFocusedNodes({ x: -secondaryGridSize, y: 0 }); break;
                case "ArrowRight": this.app.currentClass.currentMethod.moveFocusedNodes({ x: secondaryGridSize, y: 0 }); break;
                default: break;
            }
        });

        document.addEventListener("mousedown", (e) => {
            if (this.app.nodeMenu) if (!this.app.nodeMenu.element.contains(e.target)) setTimeout(() => this.app.destroyNodeMenu(), 0);
        });

        ipcRenderer.on("window-update", () => this.app.destroyNodeMenu());
    }

    left() {
        const left = this.app.interface.elements.left;
        left.classList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.createClass(this.app.getNextName(this.app.classes, "Class"));
        });
        left.variableList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.createVariable(this.app.getNextName(this.app.currentClass.variables, "Variable"));
        });
        left.methodList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.createMethod(this.app.getNextName(this.app.currentClass.methods, "Method"));
        });
        left.localVariableList.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.currentMethod.createLocalVariable(this.app.getNextName(this.app.currentClass.currentMethod.localVariables, "Local variable"));
        });
    }

    right() {
        const right = this.app.interface.elements.right;
        right.classParameters.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.createParameter(this.app.getNextName(this.app.currentClass.parameters, "Class parameter"));
        });
        right.methodParameters.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.currentMethod.createParameter(this.app.getNextName(this.app.currentClass.currentMethod.parameters, "Method parameter"));
        });
        right.methodReturns.parentElement.querySelector("button").addEventListener("click", () => {
            this.app.currentClass.currentMethod.createReturn(this.app.getNextName(this.app.currentClass.currentMethod.returns, "Method return"));
        });
        right.methodPureCheckbox.addEventListener("change", (e) => this.app.currentClass.currentMethod.setPure(e.target.checked));
    }

    center() {
        const center = this.app.interface.elements.center;
        center.method.container.addEventListener("mousedown", (e) => {
            switch (e.button) {

                case 0:
                    const clickedNode = this.app.currentClass.currentMethod.getNodeByElement(e.target);
                    const cursorPos = this.getCursorPos(e);

                    if (clickedNode) {
                        if (!e.target.classList.contains("linker")) {
                            if (e.target.tagName == "HEADER") {
                                if (!clickedNode.element.classList.contains("focused")) {
                                    [...center.method.nodeContainer.children].forEach((node) => node.classList.remove("focused"));
                                    this.held = [];
                                } else this.held.forEach((h) => {
                                    h.offset.x -= cursorPos.x;
                                    h.offset.x *= -1;
                                    h.offset.y -= cursorPos.y;
                                    h.offset.y *= -1;
                                });
    
                                clickedNode.element.classList.add("focused");
                                this.grid.click = cursorPos;
                                this.grid.button = 0;
                            }
    
                            const nodeRect = clickedNode.getRect();
                            if (this.held.filter((h) => h.node == clickedNode).length == 0) this.held.push({
                                node: clickedNode,
                                offset: {
                                    x: cursorPos.x - nodeRect.x,
                                    y: cursorPos.y - nodeRect.y,
                                },
                            });
                        } else {
                            if (e.altKey) {
                                this.app.currentClass.currentMethod.getLinksByNodeUID(clickedNode.uid).filter((link) => {
                                    return (link.parameterLink == e.target || link.returnLink == e.target);
                                }).forEach((link) => this.app.currentClass.currentMethod.removeLink(link));
                            } else this.linker = this.getLinkerData(e.target);
                        }

                    } else {
                        [...center.method.nodeContainer.children].forEach((node) => node.classList.remove("focused"));
                        this.held = [];
                        this.grid.click = cursorPos;
                        this.grid.button = 0;
                    }
                    break;

                case 2:
                    if (!this.grid.click) {
                        this.grid.click = this.getCursorPos(e);
                        this.grid.absClick = { x: e.x, y: e.y };
                        this.grid.button = 2;
                    }
                    break;

                default: break;
            }
        });
        center.method.container.addEventListener("mouseup", (e) => {
            switch (e.button) {

                case 0:
                    if (this.grid.button == 0) {
                        // NODE ZONE SELECTION
                        if (this.zone) {
                            const zoneRect = this.getZoneRect(this.getCursorPos(e));
                            const cursorPos = this.getCursorPos(e);

                            this.app.currentClass.currentMethod.nodes.forEach((node) => {
                                const nodeRect = node.getRect();

                                if (zoneRect.x < nodeRect.x + nodeRect.width && zoneRect.x + zoneRect.width > nodeRect.x && zoneRect.y < nodeRect.y + nodeRect.height && zoneRect.y + zoneRect.height > nodeRect.y) {
                                    node.element.classList.add("focused");

                                    this.held.push({
                                        node: node,
                                        offset: {
                                            x: nodeRect.x,
                                            y: nodeRect.y,
                                        },
                                    });
                                }
                            });

                            this.zone.remove();
                            this.zone = null;
                        } else {
                            this.held.forEach((h) => {
                                h.node.snap();
                                h.node.updatePos();
                                this.app.currentClass.currentMethod.getLinksByNodeUID(h.node.element.id).forEach((link) => link.hide());
                                this.app.currentClass.currentMethod.refreshLinks();
                            });

                            [...center.method.nodeContainer.children].forEach((node) => node.classList.remove("focused"));
                            this.held = [];
                        }
                        
                    } else if (this.linker && e.target.classList.contains("linker")) {
                        const linker1 = this.linker;
                        const linker2 = this.getLinkerData(e.target);
                        if (e.target.classList.contains("linked") && (linker2.isParameter || e.target.classList.contains("execute"))) return;
                        
                        if (linker1.isParameter == linker2.isParameter) return;
                        const ret = (linker1.isParameter) ? linker2 : linker1;
                        const param = (linker1.isParameter) ? linker1 : linker2;

                        const returnNode = this.app.currentClass.currentMethod.getNodeByUid(ret.nodeUid);
                        const returnIndex = ret.index;
                        const parameterNode = this.app.currentClass.currentMethod.getNodeByUid(param.nodeUid);
                        const parameterIndex = param.index;

                        if (returnNode.data.returns[returnIndex].type != parameterNode.data.parameters[parameterIndex].type) return;
                        this.app.currentClass.currentMethod.linkNodes(returnNode, returnIndex, parameterNode, parameterIndex);
                    }
                    this.linker = null;
                    
                    break;

                case 2:
                    if (!this.grid.moved) this.app.nodeMenu = new NodeMenu(this.app, { x: e.x, y: e.y });
                    center.method.container.classList.remove("moving");
                    break;

                default: break;
            }
            
            this.grid.click = null; 
            this.grid.moved = false;
            this.grid.button = null;
        });
        center.method.container.addEventListener("mousemove", (e) => {
            if (this.grid.click) {
                switch (this.grid.button) {

                    case 0:
                        if (this.held.length > 0) {
                            const cursorPos = this.getCursorPos(e);

                            this.held.forEach((h) => {
                                h.node.pos.x = cursorPos.x - h.offset.x;
                                h.node.pos.y = cursorPos.y - h.offset.y;
                                h.node.updatePos();
                                this.app.currentClass.currentMethod.getLinksByNodeUID(h.node.element.id).forEach((link) => link.hide());
                            });
                            this.app.currentClass.currentMethod.refreshLinks();

                        } else {
                            if (!this.zone) {
                                this.zone = document.createElement("div");
                                this.zone.classList.add("zone");
                                center.method.nodeContainer.appendChild(this.zone);
                            }

                            const zoneRect = this.getZoneRect(this.getCursorPos(e));
                            this.zone.style.width = `${zoneRect.width}px`;
                            this.zone.style.height = `${zoneRect.height}px`;
                            this.zone.style.top = `${zoneRect.y}px`;
                            this.zone.style.left = `${zoneRect.x}px`;
                        }
                        break;

                    case 2: 
                        this.grid.moved = true;
                        center.method.container.classList.add("moving");
                        
                        const cursorPos = this.getCursorPos(e);
                        this.app.setGridPos({ x: cursorPos.x - this.grid.click.x + this.grid.pos.x, y: cursorPos.y - this.grid.click.y + this.grid.pos.y });
                        break;

                    default: break;
                }
            } else if (this.linker) {
                // link following mouse
            }
        });
        center.method.container.addEventListener("mouseleave", (e) => {
            if (!this.grid.click) return;
            if (this.grid.moved) return;
            
            if (this.zone) {
                this.zone.remove();
                this.zone = null;
                this.grid.click = null;
                this.grid.button = null;
                this.grid.moved = false;
            }
        });
    }

    getCursorPos(e) {
        const rect = this.app.interface.elements.center.method.container.getBoundingClientRect();
        const offset = {
            x: e.x - rect.x,
            y: e.y - rect.y,
        };
        return {
            x: offset.x - this.grid.pos.x,
            y: offset.y - this.grid.pos.y,
        }
    }

    getZoneRect(cursorPos) {
        return {
            x: Math.min(this.grid.click.x, cursorPos.x),
            y: Math.min(this.grid.click.y, cursorPos.y),
            width: Math.max(this.grid.click.x, cursorPos.x) - Math.min(this.grid.click.x, cursorPos.x),
            height: Math.max(this.grid.click.y, cursorPos.y) - Math.min(this.grid.click.y, cursorPos.y),
        };
    }

    getLinkerData(element) {
        if (!element.classList.contains("linker")) return null;
        const nodeUid = parseInt(element.parentElement.parentElement.parentElement.id);
        const index = [...element.parentElement.parentElement.children].indexOf(element.parentElement);
        const isParameter = element.parentElement.parentElement.classList.contains("input-container");
        return { nodeUid, index, isParameter };
    }
};
