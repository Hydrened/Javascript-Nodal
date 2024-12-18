class Grid {
    constructor(app) {
        this.app = app;

        this.pos = { x: 128, y: 128 };
        this.moving = false;
        this.movingOffset = null;
        this.wasMoving = false;
        this.element = document.querySelector("div.current-class-grid-container");

        this.handleEvents();
        this.updatePos();
    }

    handleEvents() {
        this.element.addEventListener("mousedown", (e) => {
            if (e.button == 0) return;
            this.moving = true;
            this.element.classList.add("moving");
            setTimeout(() => this.wasMoving = true, 100);
            const containerRect = this.element.getBoundingClientRect();
            this.movingOffset = { x: this.pos.x - e.x + containerRect.x, y: this.pos.y - e.y + containerRect.y };
        });
        this.element.addEventListener("mouseup", (e) => {
            if (e.button == 0) return;
            this.moving = false;
            this.element.classList.remove("moving");
            setTimeout(() => this.wasMoving = false, 100);
            this.movingOffset = null;
        });
        this.element.addEventListener("mouseout", () => {
            this.moving = false;
            this.element.classList.remove("moving");
            this.movingOffset = null;
        });
        this.element.addEventListener("mousemove", (e) => {
            if (!this.moving) return;

            const containerRect = this.element.getBoundingClientRect();
            this.pos.x = e.x - containerRect.x + this.movingOffset.x;
            this.pos.y = e.y - containerRect.y + this.movingOffset.y;
            this.updatePos();
        });
    }

    updatePos() {
        document.documentElement.style.setProperty("--grid-pos-x", `${this.pos.x}px`);
        document.documentElement.style.setProperty("--grid-pos-y", `${this.pos.y}px`);
    }

    updateZoom() {
        document.documentElement.style.setProperty("--zoom", this.zoom);
    }
};
