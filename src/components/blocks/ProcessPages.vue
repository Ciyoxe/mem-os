<script setup lang="ts">
import { Timer } from '@/modules/Timer';
import { computed, reactive, watch, watchEffect } from 'vue';

const props = defineProps<{
    "pages"      : number,
    "selectedId" : number | null,
}>();
defineEmits<{
    (e: "selected", localPage: number): void,
    (e: "appeal", localPage: number): void,
    (e: "delete"): void,
    (e: "allocate"): void,
}>();

const pagesList = computed(()=> new Array(props.pages).fill(0).map((_, i)=> i));
</script>

<template>
<div class="flex-col proces-pages">
    <button @click="$emit('allocate')">Allocate</button>
    <button @click="$emit('delete')">Delete</button>
    <div class="list" v-if="props.selectedId !== null">
        <div class="placeholder" :style="{ height: (pagesList.length * 30) + 'px' }"></div>
        <div
            v-for="(page, index) in pagesList" :key="page"
            class="list-item flex-row" :style="{ transform: `translateY(${index * 35}px)` }"
            @click="$emit('selected', page)"
        >
            <div class="list-title">{{ page }}</div>
            <div class="selection-mark" :style="{ opacity: props.selectedId === page ? 1 : 0 }"> </div>
        </div>
    </div>
    <div v-else>
        Select process
    </div>
</div>
</template>

<style scoped lang="scss">
.proces-pages {
    gap: 10px;
    min-width: 140px;

    min-height: 300px;
    border-radius: 10px;
    border: 2px solid #0009;
    padding: 10px;
}

.selection-mark {
    width  : 20px;
    height : 20px;
    border-radius: 30%;
    background-color: #98d;
    border: 2px solid #0009;

    transition: opacity ease-in 0.2s;
}
.list {
    position: relative;
    overflow-y: scroll;

    height: 100%;
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
.placeholder {
    width: 60px;
}
</style>
