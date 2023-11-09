export class Timer {
    onTick = ()=> {};

    private paused    = false;
    private tickDelay = 100;
    private timeoutId = null as ReturnType<typeof setTimeout> | null;


    setTickSpeed(tps: number) {
        this.tickDelay = 1000 / tps;
    }
    runOneTick() {
        this.onTick();
    }
    run() {
        this.paused = false;
        const makeTick = ()=> {
            if (this.paused)
                return;
            this.onTick();
            this.timeoutId = setTimeout(makeTick, this.tickDelay);
        }
        makeTick();
    }
    stop() {
        if (this.timeoutId !== null)
            clearTimeout(this.timeoutId);
        this.paused = true;
    }
}
