class Events {
    constructor(a) {
        this.app = a;
        this.linker1 = null;
        this.keydown = [];
        
        this.main();
        this.nodeLink();
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

    nodeLink() {
        function getLinkInfos(element) {
            const uid = parseInt(element.parentElement.parentElement.parentElement.id);
            const index = [...element.parentElement.parentElement.children].indexOf(element.parentElement);
            const isParameter = element.parentElement.parentElement.classList.contains("input-container");
            return { uid, index, isParameter };
        }

        this.app.elements.center.currentBlueprintContainer.addEventListener("mousedown", (e) => {
            if (e.button != 0 || !e.target) return;
            if (!e.target.classList.contains("linker")) return;

            this.linker1 = getLinkInfos(e.target);
        });

        this.app.elements.center.currentBlueprintContainer.addEventListener("click", (e) => {
            if (e.button != 0 || !e.target) return;
            if (!e.target.classList.contains("linker") || !e.target.classList.contains("linked")) return;
            if (!this.keydown.includes("Alt")) return;

            const linker = getLinkInfos(e.target);
            console.log(linker);
            

            this.app.currentBlueprint.links.forEach((link) => {
                if (linker.isParameter) {
                    const nodes = this.app.currentBlueprint.nodes.filter((node) => node.uid == link.data.returnNode.uid);
                    nodes.forEach((node) => {
                        console.log(node);
                        
                    });

                    // this.app.currentBlueprint.nodes.filter((node) => node.uid == link.data.returnNode.uid)[0].data.returns.foreach((ret) => {

                    // });
                } else {

                }
            });
            

            // this.app.currentBlueprint.removeLink();
        });

        document.addEventListener("mouseup", (e) => {
            const linker1 = this.linker1;
            this.linker1 = null;
            if (e.button != 0 || !e.target) return;
            if (!e.target.classList.contains("linker")) return;

            const linker2 = getLinkInfos(e.target);

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
};
