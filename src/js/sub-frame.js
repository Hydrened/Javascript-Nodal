class SubFrame {
    constructor() {
        this.data = [
            {
                title: "File",
                submenus: [
                    { title: "Open", shortcut: { title: "Ctrl+O", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "O");
                    }}, call: () => {
                        console.log("open");
                    }},
                    { title: "Save", shortcut: { title: "Ctrl+S", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "S");
                    }}, call: () => {
                        console.log("save");
                    }},
                    { title: "Save as", shortcut: { title: "Ctrl+Shift+S", isValid: (e) => {
                        return (e.ctrlKey && e.shiftKey && e.key.toUpperCase() == "S");
                    }}, call: () => {
                        console.log("save as");
                    }},
                ],
            },
            {
                title: "Edit",
                submenus: [
                    { title: "Undo", shortcut: { title: "Ctrl+Z", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "Z");
                    }}, call: null },
                    { title: "Redo", shortcut: { title: "Ctrl+Y", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "Y");
                    }}, call: null },
                    { title: "br" },
                    { title: "Copy", shortcut: { title: "Ctrl+C", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "C");
                    }}, call: null },
                    { title: "Cut", shortcut: { title: "Ctrl+X", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "X");
                    }}, call: null },
                    { title: "Paste", shortcut: { title: "Ctrl+V", isValid: (e) => {
                        return (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() == "V");
                    }}, call: null },
                ],
            }
        ];
        this.elements = {
            container: document.getElementById("sub-frame-menu-container"),
        };

        this.hoverActivated = false;

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
            this.data.forEach((menu) => menu.submenus.forEach((submenu) => {
                if (submenu.shortcut && submenu.call) if (submenu.shortcut.isValid(e)) submenu.call();
            }));
        });
    }
};
