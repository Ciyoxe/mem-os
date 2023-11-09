import { System } from "./System";

export class Process {
    id;
    system;

    allocatedPages = 0;

    maxPages   = 10;
    allocRate  = 0.7;
    freeRate   = 0.2;
    appealRate = 0.5;

    constructor(system: System, id: number) {
        this.system = system;
        this.id     = id;
    }
    allocatePage() {
        this.system.allocatePage(this.id);
        this.allocatedPages++;
    }
    freePage() {
        if (this.allocatedPages <= 0)
            throw new Error("Cannot free page");
        this.system.freePage(this.id);
        this.allocatedPages--;
    }
    appeal(localPage: number) {
        if (this.allocatedPages > 0)
            this.system.appeal(this.id, localPage);
    }
    kill() {
        this.system.kill(this.id);
    }
    tick() {
        if (this.allocatedPages < this.maxPages && Math.random() < this.allocRate)
            this.allocatePage();
        if (this.allocatedPages > 0 && Math.random() < this.freeRate)
            this.freePage();
        if (Math.random() < this.appealRate)
            this.appeal(Math.floor(Math.random() * this.allocatedPages));
    }
}
