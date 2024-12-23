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
                title: "Test",
                submenus: [
                    { title: "Test", shortcut: null, call: null },
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
                const sLi = document.createElement("li");
                sLi.textContent = submenu.title;
                submenuContainer.appendChild(sLi);
                
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
