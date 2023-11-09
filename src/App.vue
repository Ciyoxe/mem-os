<script setup lang='ts'>
import { computed, onMounted, reactive, watch, watchPostEffect } from 'vue';


import ProcessPages from './components/blocks/ProcessPages.vue';
import TimeControl  from './components/blocks/TimeControl.vue';
import ProcessList  from './components/blocks/ProcessList.vue';
import Storage      from './components/blocks/Storage.vue';
import PageInfo     from './components/blocks/PageInfo.vue';
import Graph        from './components/blocks/Graph.vue';


import { System } from './modules/System';
import { Page   } from './modules/Page';


const system = new System();

const processSettings = reactive({
    processes  : [] as number[],
    pages      : 0,

    selectedId : null as number | null,
    appealRate : 0.3,
    allocRate  : 0.2,
    freeRate   : 0.1,
    maxPages   : 3,
});

const updateProcesses = ()=> {
    if (!system.processes[processSettings.selectedId ?? -1])
        processSettings.selectedId = null;

    processSettings.processes = system.processes.filter(x => x).map(x => x!.id);
    processSettings.pages     = processSettings.selectedId === null ?
        0 : system.processes[processSettings.selectedId]!.allocatedPages;
}
const selectProcess = (id: number | null) => {
    processSettings.selectedId = id;

    if (id === null)
        return;

    const process = system.processes[id]!;
    processSettings.allocRate  = process.allocRate;
    processSettings.appealRate = process.appealRate;
    processSettings.freeRate   = process.freeRate;
    processSettings.maxPages   = process.maxPages;

    updateProcesses();
}
const createProcess = ()=> {
    const new_process = system.createProcess();
    new_process.allocRate  = processSettings.allocRate;
    new_process.appealRate = processSettings.appealRate;
    new_process.freeRate   = processSettings.freeRate;
    new_process.maxPages   = processSettings.maxPages;

    processSettings.selectedId = new_process.id;
    updateProcesses();
};
const killProcess = () => {
    if (processSettings.selectedId !== null)
        system.kill(processSettings.selectedId);

    processSettings.selectedId = null;
    for (const process of system.processes) {
        if (process)
            processSettings.selectedId = process.id;
    }

    updateProcesses();
}
watch(processSettings, () => {
    const process = system.processes[processSettings.selectedId ?? -1];
    if (!process)
        return;
    process.allocRate  = processSettings.allocRate;
    process.appealRate = processSettings.appealRate;
    process.freeRate   = processSettings.freeRate;
    process.maxPages   = processSettings.maxPages;
}, { deep: true });

const storageState = reactive({
    pages           : system.storages.map(x => x.pages) as Page[][],
    selectedStorage : 0,
    selectedId      : null as number | null,
});
const updatePages = ()=> storageState.pages = system.storages.map(x => x.pages);
const activePage  = computed(()=> storageState.pages[storageState.selectedStorage][storageState.selectedId ?? -1] ?? null);

const selectedLocalPage = computed(()=> {
    if (processSettings.selectedId === null)
        return null;
    if (storageState.selectedId === null)
        return -1;
    const storage  = system.storages[storageState.selectedStorage];
    const localIdx = storage.tables[processSettings.selectedId].findIndex(x => x === storageState.selectedId);

    return localIdx;
});
const selectLocalPage = (index: number)=> {
    if (processSettings.selectedId === null)
        return;
    const storage = system.storages[storageState.selectedStorage];
    const table   = storage.tables[processSettings.selectedId];

    storageState.selectedId = table ? (table[index] ?? null) : null;
};

const allocPage = ()=> {
    if (processSettings.selectedId === null)
        return;
    system.processes[processSettings.selectedId]!.allocatePage();
}
const deletePage = ()=> {
    if (processSettings.selectedId === null)
        return;
    system.processes[processSettings.selectedId]!.freePage();
}
const appealToPage = (localPage: number)=> {
    if (processSettings.selectedId === null)
        return;
    system.processes[processSettings.selectedId]!.appeal(localPage);
};

const collectorState = reactive({
    points     : system.storages.map(_ => []) as number[][],
    range      : [0, 0] as [number, number],
    collecting : false,
});
const startCollecting = ()=> {
    collectorState.collecting = true;
    collectorState.range      = [0, 0];

    collectingValues = system.storages.map(x => x.pageFaults);
};
const stopCollecting = ()=> {
    collectorState.points     = [...collectingPoints];
    collectorState.collecting = false;

    collectingPoints = [];
}

let collectingValues = system.storages.map(x => x.pageFaults) as number[];
let collectingPoints = [] as number[][];

const update = ()=> {
    system.update();

    if (collectorState.collecting) {
        collectorState.range[1]++;

        system.storages.forEach((storage, i) => {
            if (!collectingPoints[i])
                collectingPoints[i] = [];
            collectingPoints[i].push(storage.pageFaults - collectingValues[i]);
            collectingValues[i] = storage.pageFaults;
        });
    }

    updateProcesses();
    updatePages();
}
const tick = ()=> {
    system.tick();

    updateProcesses();
    updatePages();
};
</script>

<template>
<div class="flex-col" style="gap: 10px">
    <div class="container-row flex-row">
        <ProcessList
            :processes="processSettings.processes"
            :alloc-rate="processSettings.allocRate"
            :appeal-rate="processSettings.appealRate"
            :free-rate="processSettings.freeRate"
            :max-pages="processSettings.maxPages"
            :selected-id="processSettings.selectedId"

            @alloc-rate-changed="processSettings.allocRate = $event"
            @appeal-rate-changed="processSettings.appealRate = $event"
            @free-rate-changed="processSettings.freeRate = $event"
            @max-pages-changed="processSettings.maxPages = $event"
            @selected="selectProcess($event)"
            @created="createProcess()"
            @killed="killProcess()"
        />
        <Storage
            :pages="storageState.pages"
            :selected-storage="storageState.selectedStorage"
            :selected-page="storageState.selectedId"
            :selected-process="processSettings.selectedId"
            @selected="storageState.selectedId = $event.index; storageState.selectedStorage = $event.storageIndex"
        />
    </div>
    <div class="container-row flex-row">
        <ProcessPages
            :selected-id="selectedLocalPage"
            :pages="processSettings.pages"
            @selected="selectLocalPage($event)"
            @allocate="allocPage()"
            @delete="deletePage()"
        />
        <PageInfo
            :mask-length="activePage ? activePage.maskLength : 0"
            :old-counter="activePage ? activePage.agingCounter : 0"
            :process-id="activePage ? activePage.processId : 0"
            :r-bit="activePage ? activePage.rBit : 0"
            :is-swapped="activePage ? activePage.isSwapped : false"
            :page="activePage ? activePage : 0"
        />
        <TimeControl
            @tick="tick()"
            @update="update()"
            @startcapture="startCollecting()"
            @stopcapture="stopCollecting()"
        />
        <Graph style="width: 100%; max-width: 1000px; min-width: 0;"
            :range="collectorState.range"
            :points="collectorState.points"
            :displayed="!collectorState.collecting"
        />
    </div>
</div>
</template>

<style lang='scss'>
.flex-row {
    display: flex;
    flex-direction: row;
}
.flex-col {
    display: flex;
    flex-direction: column;
}

html {
    width: 100vw;
    height: 100vh;

    font: 1rem sans-serif;
}
.container-row {
    width: 100%;
    gap: 10px;
}

input[type="number"] {
    width: 50px;
    padding: 5px;
    border: 2px solid #0009;
    border-radius: 5px;
}
button {
    padding: 5px;
    border: 2px solid #0009;
    border-radius: 5px;
}
:root {
    scrollbar-width: thin;
    accent-color: #98d;
}
</style>
