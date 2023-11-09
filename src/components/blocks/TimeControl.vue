<script setup lang="ts">
import { Timer } from '@/modules/Timer';
import { onMounted, onUnmounted, reactive, watch, watchEffect } from 'vue';

const emit = defineEmits<{
    (e: "tick"): void,
    (e: "update"): void,

    (e: "startcapture"): void,
    (e: "stopcapture"): void,
}>();

const timer = new Timer();
const state = reactive({
    capturing : false,
    running   : false,
    tps       : 1,
});

watch(()=> state.running, value => value ?
    timer.run() :
    timer.stop()
);
watchEffect(()=> timer.setTickSpeed(state.tps));

let tickCounter = 0;
timer.onTick = ()=> {
    emit("tick");
    if (tickCounter >= 8) {
        tickCounter = 0;
        emit("update");
    }
    tickCounter++;
};
</script>

<template>
<div class="flex-col col time-control">
    <div class="flex-row row">
        <button class="time-control-btn" @click="state.running = !state.running">
            {{ state.running ? "||" : ">>" }}
        </button>
        <button class="time-control-btn" @click="timer.runOneTick()">
            >|
        </button>
    </div>
    <div class="flex-row row">
        tps:
        <input type="range" min="1" max="50" step="1" :value="state.tps" @input="state.tps =
            Math.max(1, Math.min(50, Number.parseFloat(($event.target as any).value)))
        ">
        <input type="number" min="1" max="50" step="1" :value="state.tps" @input="state.tps =
            Math.max(1, Math.min(50, Number.parseFloat(($event.target as any).value)))
        ">
    </div>

    <div class="flex-row row">
        <button class="time-control-btn" @click="$emit('tick')">
            Tick
        </button>
        <button class="time-control-btn" @click="$emit('update')">
            Update
        </button>
    </div>
    <div class="flex-row row">
        <button class="time-control-btn" :class="{ 'capture': state.capturing }" @click="
            state.capturing = !state.capturing;
            state.capturing ?
                $emit('startcapture') :
                $emit('stopcapture');
        ">
            {{ state.capturing ? "Stop capturing" : "Start capturing" }}
        </button>
    </div>
</div>
</template>

<style scoped lang="scss">
.time-control-btn {
    width: 100%;
}
.capture {
    border: 2px solid rgb(195, 156, 240);
    background-color: rgb(248, 213, 213);
}
.row, .col {
    gap: 10px;
}
.time-control {
    min-height: 300px;
    border-radius: 10px;
    border: 2px solid #0009;
    padding: 10px;
}
</style>
