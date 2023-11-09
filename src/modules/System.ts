import {
    MemoryManager,
    randomStrategy,
    agingStrategy
} from "./MemoryManager";
import { Process } from "./Process";

export class System {
    processes = [] as (Process | undefined)[];
    storages  = [
        new MemoryManager(randomStrategy),
        new MemoryManager(randomStrategy),
        new MemoryManager(agingStrategy),
    ];

    allocatePage(processId: number) {
        for (const storage of this.storages)
            storage.allocatePage(processId);
    }
    freePage(processId: number) {
        for (const storage of this.storages)
            storage.freePage(processId);
    }
    appeal(processId: number, localPage: number) {
        for (const storage of this.storages)
            storage.appeal(processId, localPage);
    }
    kill(processId: number) {
        for (const storage of this.storages)
            storage.kill(processId);
        this.processes[this.processes.findIndex(x => x && x.id === processId)] = undefined;
    }
    createProcess() {
        const newId   = this.processes.findIndex(x => !x);
        const process = new Process(this, newId >= 0 ? newId : this.processes.length);

        this.processes[process.id] = process;
        return process;
    }

    tick() {
        for (const process of this.processes.filter(x => x))
            process!.tick();
        for (const storage of this.storages)
        for (const page of storage.pages)
            page.tick();
    }
    update() {
        for (const storage of this.storages)
        for (const page of storage.pages)
            page.update();
    }
}
