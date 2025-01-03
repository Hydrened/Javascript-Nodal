class Confirm {
    constructor(message, options) {
        this.antiClick = document.createElement("div");
        this.antiClick.classList.add("anti-click");
        document.body.appendChild(this.antiClick);

        const popup = document.createElement("div");
        this.antiClick.appendChild(popup);

        const mes = document.createElement("h3");
        mes.textContent = message;
        popup.appendChild(mes);

        const buttonContainer = document.createElement("div");
        popup.appendChild(buttonContainer);

        options.forEach((option) => {
            const button = document.createElement("button");
            button.textContent = option.button;
            buttonContainer.appendChild(button);

            button.addEventListener("click", () => {
                if (option.call) option.call();
                this.close();
            });
        });

        window.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "Escape": this.close(); break;
                case "Enter": if (options.length > 0) if (options[0].call) {
                    options[0].call();
                    this.close();
                } break;
                default: break;
            }
        });
    }

    close() {
        this.antiClick.remove();
        delete this;
    }
};
