class SubFrame {
    constructor(app) {
        this.app = app;
        this.data = [
            {
                title: "File",
                submenus: [
                    { title: "Open", shortcut: { title: "Ctrl+O", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "O");
                    }}, call: () => this.openProject() },
                    { title: "Save", shortcut: { title: "Ctrl+S", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "S");
                    }}, call: () => this.saveProject() },
                    { title: "Save as", shortcut: { title: "Ctrl+Shift+S", isValid: (e) => {
                        return (e.ctrlKey && e.shiftKey && e.key.toUpperCase() == "S");
                    }}, call: () => this.saveAsProject() },
                ],
            },
            {
                title: "Edit",
                submenus: [
                    { title: "Undo", shortcut: { title: "Ctrl+Z", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "Z");
                    }}, call: () => this.undo() },
                    { title: "Redo", shortcut: { title: "Ctrl+Y", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "Y");
                    }}, call: () => this.redo() },
                    { title: "br" },
                    { title: "Copy", shortcut: { title: "Ctrl+C", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "C");
                    }}, call: () => this.copy() },
                    { title: "Cut", shortcut: { title: "Ctrl+X", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "X");
                    }}, call: () => this.cut() },
                    { title: "Paste", shortcut: { title: "Ctrl+V", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "V");
                    }}, call: () => this.paste() },
                    { title: "Duplicate", shortcut: { title: "Ctrl+D", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "D");
                    }}, call: () => this.duplicate() },
                    { title: "br" },
                    { title: "Remove", shortcut: { title: "Suppr", isValid: (e) => {
                        return (!e.ctrlKey && !e.shiftKey && (e.key.toUpperCase() == "BACKSPACE" || e.key.toUpperCase() == "DELETE"));
                    }}, call: () => this.remove() },
                ],
            },
            {
                title: "Run",
                submenus: [
                    { title: "Get code", shortcut: { title: "F5", isValid: (e) => {
                        return (!e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "F5");
                    }}, call: () => this.getCode() },
                ],
            },
        ];
        this.elements = {
            container: document.getElementById("sub-frame-menu-container"),
        };

        this.hoverActivated = false;
        this.absCursorPos = { x: 0, y: 0 };

        this.createMenu();
        this.handleEvents();
    }

    createMenu() {
        this.data.forEach((menu) => {
            const li = document.createElement("li");
            this.elements.container.appendChild(li);

            const title = document.createElement("p");
            title.textContent = menu.title;
            li.appendChild(title);

            const submenuContainer = document.createElement("ul");
            li.appendChild(submenuContainer);

            menu.submenus.forEach((submenu) => {
                const br = submenu.title == "br";
                
                const sLi = document.createElement("li");
                if (!br) sLi.textContent = submenu.title;
                else sLi.classList.add("br");
                submenuContainer.appendChild(sLi);

                if (br) return;
                
                if (submenu.shortcut) {
                    const shortcut = document.createElement("span");
                    shortcut.textContent = submenu.shortcut.title;
                    sLi.appendChild(shortcut);
                }

                if (submenu.call) sLi.addEventListener("click", () => submenu.call());
            });
        });
    }

    handleEvents() {
        document.addEventListener("keydown", (e) => {
            if (document.querySelectorAll("input:focus").length > 0) return;
            this.data.forEach((menu) => menu.submenus.forEach((submenu) => {
                if (submenu.shortcut && submenu.call) if (submenu.shortcut.isValid(e)) submenu.call();
            }));
        });

        document.addEventListener("mousemove", (e) => this.absCursorPos = { x: e.x, y: e.y });
    }

    update() {

    }

    getFocusedNodes() {
        return [...this.app.interface.elements.center.method.nodeContainer.querySelectorAll(".node.focused")];
    }

    open() {

    }

    save() {

    }

    saveAs() {

    }

    undo() {

    }

    redo() {

    }

    copy() {
        const method = this.app.currentClass.currentMethod;
        const nodes = this.getFocusedNodes().map((el) => method.getNodeByElement(el)).filter((node) => node.uid > 0);
        if (nodes.length == 0) return;
        const nodePositions = nodes.map((node) => node.pos);
        const minX = nodePositions.map((pos) => pos.x).sort().at(0);
        const minY = nodePositions.map((pos) => pos.y).sort().at(0);
        method.copyNodes(nodes, { x: minX, y: minY });
    }

    cut() {
        const method = this.app.currentClass.currentMethod;
        this.copy();
        this.getFocusedNodes().forEach((el) => method.removeNode(method.getNodeByElement(el)));
    }

    paste() {
        const method = this.app.currentClass.currentMethod;
        method.pasteNodes(this.app.events.getCursorPos(this.absCursorPos));
    }

    duplicate() {

    }

    remove() {
        const method = this.app.currentClass.currentMethod;
        this.getFocusedNodes().forEach((el) => method.removeNode(method.getNodeByElement(el)));
    }
    
    getCode() {
        
    }
};
