import { Page    } from "./Page";


export function randomStrategy(mem: MemoryManager, pageId: number) {
    const pagesInRam = [];
    for (let i = 0; i < mem.pages.length; i++)
        if (!mem.pages[i].isSwapped)
            pagesInRam.push(i);
    const index = pagesInRam[Math.floor(Math.random() * pagesInRam.length)];

    mem.unload(index);
    mem.load(pageId);
}

export function agingStrategy(mem: MemoryManager, pageId: number) {
    let minCounter = Number.MAX_VALUE;
    let minIndex   = -1;
    for (let i = 0; i < mem.pages.length; i++)
        if (!mem.pages[i].isSwapped && mem.pages[i].agingCounter < minCounter) {
            minIndex   = i;
            minCounter = mem.pages[i].agingCounter;
        }
    if (minIndex === -1)
        throw new Error("Cannot swap pages");

    mem.unload(minIndex);
    mem.load(pageId);
}

export class MemoryManager {
    pageFaultAction;

    pageFaults = 0;

    ramSize = 16;
    swapped = 48;

    // index - global page id
    pages  = [] as Page[];
    // index - process id    -> local page table
    // index - local page id -> global page id
    tables = [] as number[][];


    constructor(pageFaultStrategy: (mem: MemoryManager, pageId: number)=> void) {
        this.pageFaultAction = pageFaultStrategy;
        for (let i = 0; i < this.ramSize + this.swapped; i++)
            this.pages.push(new Page());
        for (let i = this.ramSize; i < this.pages.length; i++)
            this.pages[i].isSwapped = true;
    }

    load(pageId: number) {
        if (this.pages[pageId].isSwapped) {
            this.pages[pageId].isSwapped = false;
            this.swapped--;
        }
    }
    unload(pageId: number) {
        if (!this.pages[pageId].isSwapped) {
            this.pages[pageId].isSwapped = true;
            this.swapped++;
        }
    }

    appeal(processId: number, localPage: number) {
        const pageIndex = this.tables[processId][localPage];
        const page      = this.pages[pageIndex];

        if (page.isSwapped) {
            this.pageFaults++;
            const pagesInRam = this.pages.length - this.swapped;
            if (pagesInRam < this.ramSize)
                this.load(pageIndex);
            else
                this.pageFaultAction(this, pageIndex);
        }
        page.appeal();
    }
    allocatePage(processId: number) {
        const pageIdx = this.pages.findIndex(x => x.isFree);
        if (pageIdx < 0)
            throw new Error("Cannot allocate page: Memory is full");
        if (!this.tables[processId])
            this.tables[processId] = [];

        this.pages[pageIdx].alloc(processId);
        this.tables[processId].push(pageIdx);
    }
    freePage(processId: number) {
        const localTable = this.tables[processId];
        const globalPage = localTable[localTable.length - 1];
        if (globalPage === undefined)
            throw new Error("Cannot free page: Process has no allocated pages");
        localTable.pop();
        this.pages[globalPage].free();
    }
    kill(processId: number) {
        if (!this.tables[processId])
            return;
        for (const localTable of this.tables[processId])
            this.pages[localTable].free();
        this.tables[processId] = [];
    }
}
