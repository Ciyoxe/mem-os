export class Page {
    processId = -1;
    isSwapped = false;

    rBit         = 0;
    agingCounter = 0;
    maskLength   = 8;

    constructor(mask_length = 8) {
        if (mask_length < 1 || mask_length > 32)
            throw new Error("Wrong page mask length");
        this.maskLength = mask_length;
    }

    get isFree() {
        return this.processId < 0;
    }

    appeal() {
        this.rBit = 1;
    }
    tick() {

    }
    update() {
        this.agingCounter >>= 1;
        this.agingCounter |= this.rBit << 7;
        this.agingCounter &= (~0) >>> (32 - this.maskLength);

        this.rBit = 0;
    }
    alloc(processId: number) {
        this.processId = processId;
        this.rBit      = 0;
    }
    free() {
        if (this.isFree)
            throw new Error("Cannot free page");
        this.processId = -1;
        this.rBit      = 0;
    }
}
