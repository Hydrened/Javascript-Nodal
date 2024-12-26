class Message {
    constructor(app, type, message) {
        this.app = app;
        this.type = type;
        this.message = message;

        this.element = null;
        this.create();
    }

    create() {
        this.element = document.createElement("div");
        this.element.classList.add("message");
        this.element.classList.add(this.type);
        setTimeout(() => this.element.classList.add("show"), 0);
        this.element.textContent = this.message;
        // this.app.elements.center.currentClassContainer.appendChild(this.element);
        console.log(this.type + ": " + this.message);
        
        this.element.addEventListener("click", () => this.destroy());
        setTimeout(() => this.destroy(), 5000);
    }

    destroy() {
        if (this.element) {
            this.element.classList.remove("show");
            setTimeout(() => this.element.remove(), 300);
        }
        setTimeout(() => delete this, 300);
    }
};
