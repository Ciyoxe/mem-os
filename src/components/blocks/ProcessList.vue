<script setup lang='ts'>
const props = defineProps<{
    "processes"  : number[],
    "selectedId" : number | null,
    "appealRate" : number,
    "allocRate"  : number,
    "freeRate"   : number,
    "maxPages"   : number,
}>();
defineEmits<{
    (e: "killed"): void,
    (e: "created"): void,
    (e: "selected", processId: number | null): void,
    (e: "appealRateChanged", value: number): void,
    (e: "allocRateChanged",  value: number): void,
    (e: "freeRateChanged",   value: number): void,
    (e: "maxPagesChanged",   value: number): void,
}>();

</script>

<template>
<div class="flex-row process-list">
    <div class="list">
        <div class="placeholder" :style="{ height: (props.processes.length * 30) + 'px' }"></div>
        <div
            v-for="(process, index) in props.processes" :key="process"
            class="list-item flex-row" :style="{ transform: `translateY(${index * 35}px)` }"
            @click="$emit('selected', process)"
        >
            <div class="list-title">{{ process }}</div>
            <div class="selection-mark" :style="{ opacity: props.selectedId === process ? 1 : 0 }"> </div>
        </div>
    </div>
    <div class="settings flex-col">
        <div class="flex-row" style="gap: 10px;">
            <button class="kill-btn" :disabled="props.selectedId === null" @click="$emit('killed')">Kill</button>
            <button class="create-btn" @click="$emit('created')">Create</button>
        </div>
        {{ props.selectedId === null ? "No process selected" : ("Selected process: " + props.selectedId) }}
        <div class="flex-row" style="gap: 10px">
            <div class="setting-title">Alloc rate:</div>
            <input type="range" :value="props.allocRate" min="0" max="1" step="0.01" @input="$emit('allocRateChanged', Number.parseFloat(($event.target as any).value))">
            {{ props.allocRate.toFixed(2) }}
        </div>
        <div class="flex-row" style="gap: 10px">
            <div class="setting-title">Appeal rate:</div>
            <input type="range" :value="props.appealRate" min="0" max="1" step="0.01" @input="$emit('appealRateChanged', Number.parseFloat(($event.target as any).value))">
            {{ props.appealRate.toFixed(2) }}
        </div>
        <div class="flex-row" style="gap: 10px">
            <div class="setting-title">Free rate:</div>
            <input type="range" :value="props.freeRate" min="0" max="1" step="0.01" @input="$emit('freeRateChanged', Number.parseFloat(($event.target as any).value))">
            {{ props.freeRate.toFixed(2) }}
        </div>
        <div class="flex-row" style="gap: 10px">
            <div class="setting-title">Max pages:</div>
            <input type="number" :value="props.maxPages" min="1" max="100" step="1" @input="$emit('maxPagesChanged', Number.parseInt(($event.target as any).value))">
        </div>
    </div>
</div>
</template>

<style scoped lang='scss'>
.process-list {
    gap: 10px;
    height : 250px;
    min-width  : 420px;

    border-radius: 10px;
    border: 2px solid #0009;
    padding: 10px;
}
.list {
    position: relative;
    overflow-y: scroll;

    height: 100%;
    min-width: 80px;
}
.placeholder {
    width: 60px;
}
.list-item {
    position: absolute;
    top  : 0;
    left : 0;

    transition: transform ease 0.5s;
    align-items: center;
}
.list-title {
    min-width: 30px;
    max-width: 100px;
}
.selection-mark {
    width  : 20px;
    height : 20px;
    border-radius: 30%;
    background-color: #98d;
    border: 2px solid #0009;

    transition: opacity ease-in 0.2s;
}

.settings {
    gap: 10px;
}
.setting-title {
    min-width: 100px;
}
button {
    width: 100%;
}
</style>
