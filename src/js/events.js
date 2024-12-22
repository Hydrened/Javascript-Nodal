class Events {
    constructor(a) {
        this.app = a;
        this.linker1 = null;
        this.keydown = [];
        this.held = [];
        this.ctxMenu = null;
        this.origin = null;
        this.zone = null;
        
        this.main();
        this.linkNode();
        this.moveNode();
        this.contextMenu();
        this.removeNode();
        this.leftInterface();
        this.selectZone();
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

        this.app.elements.center.currentClassContainer.addEventListener("mousedown", (e) => {
            if (e.button != 0 || !e.target) return;
            if (!e.target.classList.contains("linker")) return;

            const linker = getLinkInfos(e.target);
            if (e.target.classList.contains("linked") && (linker.isParameter || e.target.classList.contains("execute"))) return;
            
            this.linker1 = linker;
            document.querySelector("div.current-class-grid-container").classList.add("linking");
        });

        document.addEventListener("mouseup", (e) => {
            document.querySelector("div.current-class-grid-container").classList.remove("linking");
            if (e.button != 0 || !e.target) return;
            if (!this.linker1) return;
            if (!e.target.classList.contains("linker")) return;

            const linker1 = this.linker1;
            const linker2 = getLinkInfos(e.target);
            if (e.target.classList.contains("linked") && (linker2.isParameter || e.target.classList.contains("execute"))) return;
            this.linker1 = null;

            if (linker1.isParameter == linker2.isParameter) return;
            const ret = (linker1.isParameter) ? linker2 : linker1;
            const param = (linker1.isParameter) ? linker1 : linker2;

            const currentMethod = this.app.currentClass.currentMethod;
            const returnNode = currentMethod.nodes.filter((node) => node.uid == ret.uid)[0];
            const returnIndex = ret.index;
            const parameterNode = currentMethod.nodes.filter((node) => node.uid == param.uid)[0];
            const parameterIndex = param.index;

            if (returnNode.data.returns[returnIndex].type != parameterNode.data.parameters[parameterIndex].type) return;
            currentMethod.linkNodes(returnNode, returnIndex, parameterNode, parameterIndex);
        });
    }

    moveNode() {
        this.app.elements.center.currentClassContainer.addEventListener("mousedown", (e) => {
            if (e.button != 0) return;
            if (e.target.tagName != "HEADER") return;
            if (!e.target.parentElement.classList.contains("node")) return;

            const r = [...this.app.elements.center.nodeContainer.children].filter((node) => node.contains(e.target) || node == e.target)[0];
            if (r) r.classList.add("focused");

            [...this.app.elements.center.nodeContainer.querySelectorAll(".node.focused")].forEach((element) => {
                const node = this.app.currentClass.currentMethod.nodes.filter((node) => node.uid == element.id)[0];
                const rect = node.element.getBoundingClientRect();
                this.held.push({
                    node: node,
                    offset: {
                        x: e.x - rect.x,
                        y: e.y - rect.y,
                    },
                });
            });
        });

        function updateFocusedNodesPos(events, e, snap) {
            const cursorPos = events.app.getCursorPos(e);

            events.held.forEach((h) => {
                h.node.pos.x = cursorPos.x - h.offset.x;
                h.node.pos.y = cursorPos.y - h.offset.y;

                if (snap) h.node.snap();
                h.node.updatePos();

                events.app.currentClass.currentMethod.getLinksByNodeUID(h.node.element.id).forEach((link) => link.hide());
                events.app.currentClass.currentMethod.refreshLinks();
            });
        }

        this.app.elements.center.currentClassContainer.addEventListener("mouseup", (e) => {
            if (this.held.length == 0) return;
            updateFocusedNodesPos(this, e, true);
            this.held.forEach((h) => h.node.element.classList.add("focused"));
            this.held = [];
        });

        this.app.elements.center.currentClassContainer.addEventListener("mousemove", (e) => {
            if (this.held.length == 0) return;
            updateFocusedNodesPos(this, e, false);
        });
    }

    contextMenu() {
        this.app.elements.center.currentClassContainer.addEventListener("mouseup", (e) => {
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
                [...document.querySelectorAll(".node.focused")].forEach((node) => this.app.currentClass.currentMethod.removeNode(node.id));
            }
        });
    }

    leftInterface() {
        this.app.elements.left.classList.parentElement.querySelector(".details > button").addEventListener("click", () => {
            const defaultNames = Object.keys(this.app.classes).filter((name) => name.includes("Class"));
            if (defaultNames.includes("Class")) {
                let i = 1;
                while (true && i < 1000) {
                    if (!defaultNames.includes(`Class ${i}`)) {
                        this.app.createClass(`Class ${i}`);
                        break;
                    }
                    i++;
                }
            } else this.app.createClass("Class");
        });

        this.app.elements.left.methodList.parentElement.querySelector(".details > button").addEventListener("click", () => {
            const defaultNames = Object.keys(this.app.currentClass.methods).filter((name) => name.includes("Method"));
            if (defaultNames.includes("Method")) {
                let i = 1;
                while (true && i < 1000) {
                    if (!defaultNames.includes(`Method ${i}`)) {
                        this.app.currentClass.createMethod(`Method ${i}`);
                        break;
                    }
                    i++;
                }
            } else this.app.currentClass.createMethod("Method");
        });

        this.app.elements.left.variableList.parentElement.querySelector(".details > button").addEventListener("click", () => {
            const defaultNames = Object.keys(this.app.currentClass.variables).filter((name) => name.includes("Variable"));
            if (defaultNames.includes("Variable")) {
                let i = 1;
                while (true && i < 1000) {
                    if (!defaultNames.includes(`Variable ${i}`)) {
                        this.app.currentClass.createVariable(`Variable ${i}`);
                        break;
                    }
                    i++;
                }
            } else this.app.currentClass.createVariable("Variable");
        });

        this.app.elements.left.localVariableList.parentElement.querySelector(".details > button").addEventListener("click", () => {
            const defaultNames = Object.keys(this.app.currentClass.currentMethod.localVariables).filter((name) => name.includes("Local variable"));
            if (defaultNames.includes("Local variable")) {
                let i = 1;
                while (true && i < 1000) {
                    if (!defaultNames.includes(`Local variable ${i}`)) {
                        this.app.currentClass.currentMethod.createLocalVariable(`Local variable ${i}`);
                        break;
                    }
                    i++;
                }
            } else this.app.currentClass.currentMethod.createLocalVariable("Local variable");
        });
    }

    selectZone() {
        this.app.elements.center.currentClassContainer.addEventListener("mousedown", (e) => {
            if (e.button != 0) return;
            if (this.held.length == 0) this.app.currentClass.currentMethod.nodes.forEach((node) => node.element.classList.remove("focused"));
            const pos = this.app.getCursorPos(e);
            this.origin = pos;
        });

        this.app.elements.center.currentClassContainer.addEventListener("mousemove", (e) => {
            if (!this.origin) return;
            if (this.zone) this.zone.remove();
            if (this.held.length > 0) return;
            
            const pos = this.app.getCursorPos(e);
            const rect = {
                x: Math.min(this.origin.x, pos.x),
                y: Math.min(this.origin.y, pos.y),
                width: Math.max(this.origin.x, pos.x) - Math.min(this.origin.x, pos.x),
                height: Math.max(this.origin.y, pos.y) - Math.min(this.origin.y, pos.y),
            };

            this.zone = document.createElement("div");
            this.zone.classList.add("focused-zone");
            this.zone.style.top = `${rect.y}px`;
            this.zone.style.left = `${rect.x}px`;
            this.zone.style.width = `${rect.width}px`;
            this.zone.style.height = `${rect.height}px`;
            this.app.elements.center.nodeContainer.appendChild(this.zone);
        });

        this.app.elements.center.currentClassContainer.addEventListener("mouseup", (e) => {
            if (e.button != 0) return;
            if (this.zone) this.zone.remove();
            const pos = this.app.getCursorPos(e);
            const rect = {
                x: Math.min(this.origin.x, pos.x),
                y: Math.min(this.origin.y, pos.y),
                width: Math.max(this.origin.x, pos.x) - Math.min(this.origin.x, pos.x),
                height: Math.max(this.origin.y, pos.y) - Math.min(this.origin.y, pos.y),
            };
            this.origin = null;
            
            this.app.currentClass.currentMethod.nodes.forEach((node) => {
                const nodeRect = node.getRect();
                if (rect.x < nodeRect.x + nodeRect.width && rect.x + rect.width > nodeRect.x && rect.y < nodeRect.y + nodeRect.height && rect.y + rect.height > nodeRect.y) {
                    node.element.classList.add("focused");
                }
            });
        });
    }
};
