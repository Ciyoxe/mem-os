<script setup lang='ts'>
import { useAnimation, useEvent } from '@/composables/elements';
import { reactive, ref, watch, watchPostEffect } from 'vue';

const colors = [
    "#55f",
    "#f55",
    "#5f5",
    "#5ff",
    "#f5f",
    "#ff5",
];
const props = defineProps<{
    "points"    : number[][],
    "range"     : [number, number],
    "displayed" : boolean,
}>();

const state = reactive({
    displayFactor : 0,
});

const canvasRef = ref<HTMLCanvasElement>();

watchPostEffect(()=> {
    if (!canvasRef.value)
        return;
    const canvas = canvasRef.value;
    const ctx    = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let max_value = 0;
    for (const arr of props.points)
    for (const val of arr)
        max_value = Math.max(max_value, val);

    if (state.displayFactor > 0.001) {
        props.points.forEach((arr, i)=> {
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 3;
            ctx.beginPath();
            arr.forEach((point, j)=> {
                const x = canvas.width * j / (arr.length - 1);
                const y = 450 - (point * 450 / max_value * state.displayFactor);
                if (j === 0)
                ctx.moveTo(x, y);
                else
                ctx.lineTo(x, y);
            });
            ctx.stroke();
        });
    }

    const range_step = Math.round(10 ** (Math.round(Math.log10(props.range[1] - props.range[0])) - 1));

    ctx.textBaseline = "top";
    ctx.font         = "16px Serif";
    ctx.fillStyle    = "black";
    ctx.fillRect(0, 450, canvas.width, 2);

    ctx.textAlign = "left";
    ctx.fillRect(0, 441, 2, 20);
    ctx.fillText(Math.round(props.range[0]).toString(), 0, 470);

    ctx.textAlign = "right";
    ctx.fillRect(canvas.width - 2, 441, 2, 20);
    ctx.fillText(Math.round(props.range[1]).toString(), canvas.width, 470);

    ctx.textAlign = "center";
    const range_begin = Math.round(props.range[0] / range_step + 1) * range_step;
    const range_end   = Math.round(props.range[1] / range_step - 1) * range_step;
    for (let i = range_begin; i <= range_end; i += range_step) {
        ctx.fillRect(canvas.width * (i - props.range[0]) / (props.range[1] - props.range[0]) - 1, 441, 2, 20);
        ctx.fillText(i.toString(), canvas.width * (i - props.range[0]) / (props.range[1] - props.range[0]), 470);
    }
});
watch(()=> props.displayed, value => {
    const target  = value ? 1 : 0;
    const current = state.displayFactor;

    useAnimation((stop, time_ms) => {
        const factor = (time_ms / 500) ** 3;
        state.displayFactor = target * factor + current * (1 - factor);
        if (time_ms > 500) {
            state.displayFactor = target;
            stop();
        }
    });
});

</script>

<template>
<div class="graph flex-col">
    <canvas ref="canvasRef" width="1024" height="512"></canvas>
    <div class="flex-row" style="gap: 10px; align-items: center;">
        <template v-for="(row, i) in props.points" :key="i">
            <div class="circle" :style="{ backgroundColor: colors[i % colors.length] }">{{ i + 1 }}</div>
            - {{ row.reduce((a, b) => a + b, 0) }}
        </template>
    </div>
</div>
</template>

<style scoped lang='scss'>
.graph {
    gap: 5px;

    border-radius: 10px;
    border: 2px solid #0009;
    padding: 10px;
}
.row {
    gap: 10px;
}
.circle {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 20px;
    border-radius: 30%;
    aspect-ratio: 1;
    border: 2px solid #0009;
}
</style>
