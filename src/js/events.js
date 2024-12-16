class Events {
    constructor(a) {
        this.app = a;
        this.linker1 = null;
        this.keydown = [];
        this.held = null;
        this.ctxMenu = null;
        
        this.main();
        this.linkNode();
        this.moveNode();
        this.contextMenu();
        this.removeNode();
    }

    main() {
        ipcRenderer.on("window-update", (e, data) => {
            this.app.window.x = data.x;
            this.app.window.y = data.y;
            this.app.window.w = data.width;
            this.app.window.h = data.height;
            this.app.window.f = data.f;
        });

        document.addEventListener("keydown", (e) => {
            if (this.keydown.includes(e.key)) return;
            this.keydown.push(e.key);
        });
        document.addEventListener("keyup", (e) => this.keydown.splice(this.keydown.indexOf(e.key), 1));
    }

    linkNode() {
        function getLinkInfos(element) {
            const uid = parseInt(element.parentElement.parentElement.parentElement.id);
            const index = [...element.parentElement.parentElement.children].indexOf(element.parentElement);
            const isParameter = element.parentElement.parentElement.classList.contains("input-container");
            return { uid, index, isParameter };
        }

        this.app.elements.center.currentBlueprintContainer.addEventListener("mousedown", (e) => {
            if (e.button != 0 || !e.target) return;
            if (!e.target.classList.contains("linker")) return;

            const linker = getLinkInfos(e.target);
            if (linker.isParameter && e.target.classList.contains("linked")) return;
            this.linker1 = linker;
        });

        // this.app.elements.center.currentBlueprintContainer.addEventListener("click", (e) => {
        //     if (e.button != 0 || !e.target) return;
        //     if (!e.target.classList.contains("linker") || !e.target.classList.contains("linked")) return;
        //     if (!this.keydown.includes("Alt")) return;

        //     // const linker = getLinkInfos(e.target);
        //     // console.log(linker);
            

        //     // this.app.currentBlueprint.links.forEach((link) => {
        //     //     if (linker.isParameter) {
        //     //         const nodes = this.app.currentBlueprint.nodes.filter((node) => node.uid == link.data.returnNode.uid);
        //     //         nodes.forEach((node) => {
        //     //             console.log(node);
                        
        //     //         });

        //     //         // this.app.currentBlueprint.nodes.filter((node) => node.uid == link.data.returnNode.uid)[0].data.returns.foreach((ret) => {

        //     //         // });
        //     //     } else {

        //     //     }
        //     // });
            

        //     // this.app.currentBlueprint.removeLink();
        // });

        document.addEventListener("mouseup", (e) => {
            if (e.button != 0 || !e.target) return;
            if (!this.linker1) return;
            if (!e.target.classList.contains("linker")) return;

            const linker1 = this.linker1;
            const linker2 = getLinkInfos(e.target);
            if (linker2.isParameter && e.target.classList.contains("linked")) return;
            this.linker1 = null;

            if (linker1.isParameter == linker2.isParameter) return;
            const ret = (linker1.isParameter) ? linker2 : linker1;
            const param = (linker1.isParameter) ? linker1 : linker2;

            const currentBlueprint = this.app.currentBlueprint;
            const returnNode = currentBlueprint.nodes.filter((node) => node.uid == ret.uid)[0];
            const returnIndex = ret.index;
            const parameterNode = currentBlueprint.nodes.filter((node) => node.uid == param.uid)[0];
            const parameterIndex = param.index;

            if (returnNode.data.returns[returnIndex].type != parameterNode.data.parameters[parameterIndex].type) return;
            currentBlueprint.linkNodes(returnNode, returnIndex, parameterNode, parameterIndex);
        });
    }

    moveNode() {
        this.app.elements.center.currentBlueprintContainer.addEventListener("mousedown", (e) => {
            this.app.currentBlueprint.nodes.forEach((node) => node.element.classList.remove("focused"));

            if (e.button != 0) return;
            if (e.target.tagName != "HEADER") return;
            if (!e.target.parentElement.classList.contains("node")) return;

            const node = this.app.currentBlueprint.nodes.filter((node) => node.uid == e.target.parentElement.id)[0];
            node.element.classList.add("focused");
            const nodeRect = node.element.getBoundingClientRect();
            this.held = {
                node: node,
                offset: {
                    x: e.x - nodeRect.x,
                    y: e.y - nodeRect.y,
                },
            };
        });

        function updateNodePos(events, e, snap) {
            const cursorPos = events.app.getCursorPos(e);
            events.held.node.pos.x = cursorPos.x - events.held.offset.x;
            events.held.node.pos.y = cursorPos.y - events.held.offset.y;
            
            if (snap) events.held.node.snap();
            events.held.node.updatePos();

            events.app.getLinksByNodeUID(events.held.node.element.id).forEach((link) => link.hide());
            events.app.currentBlueprint.refreshLinks();
        }

        this.app.elements.center.currentBlueprintContainer.addEventListener("mouseup", (e) => {
            if (!this.held) return;
            updateNodePos(this, e, true);
            this.held = null;
        });

        this.app.elements.center.currentBlueprintContainer.addEventListener("mousemove", (e) => {
            if (!this.held) return;
            updateNodePos(this, e, false);
        });
    }

    contextMenu() {
        this.app.elements.center.currentBlueprintContainer.addEventListener("mouseup", (e) => {
            if (e.button != 2) return;
            if (this.app.grid.wasMoving) return;
            
            if (this.ctxMenu) this.app.destroyContextMenu();
            this.ctxMenu = new ContextMenu(this.app, { x: e.x, y: e.y });
        });

        document.addEventListener("mousedown", (e) => {
            if (this.ctxMenu) {
                if (!this.ctxMenu.element.contains(e.target)) this.app.destroyContextMenu();
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.key == "Escape" && this.ctxMenu) this.app.destroyContextMenu();
        });
    }

    removeNode() {
        window.addEventListener("keydown", (e) => {
            if (["Delete","Backspace"].includes(e.key)) {
                const focusedNode = document.querySelector(".node.focused");
                if (focusedNode) this.app.currentBlueprint.removeNode(focusedNode.id);
            }
        });
    }
};
