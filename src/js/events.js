class Events {
    constructor(a) {
        this.app = a;
        
        this.main();
    }

    main() {
        ipcRenderer.on("window-update", (e, data) => {
            this.app.window.x = data.x;
            this.app.window.y = data.y;
            this.app.window.w = data.width;
            this.app.window.h = data.height;
            this.app.window.f = data.f;
        });
    }
};
