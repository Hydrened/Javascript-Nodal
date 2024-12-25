class Confirm {
    constructor(message, options) {
        const antiClick = document.createElement("div");
        antiClick.classList.add("anti-click");
        document.body.appendChild(antiClick);

        const popup = document.createElement("div");
        antiClick.appendChild(popup);

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
                antiClick.remove();
                delete this;
            });
        });
    }
};
