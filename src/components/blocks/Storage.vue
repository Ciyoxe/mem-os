<script setup lang='ts'>
import type { Page } from '@/modules/Page';

const props = defineProps<{
    "pages": Page[][],
    "selectedStorage" : number,
    "selectedPage"    : number | null,
    "selectedProcess" : number | null,
}>();
defineEmits<{
    (e: "selected", _: { storageIndex: number, index: number }): void
}>();
</script>

<template>
<div class="flex-col storage">
    <div class="flex-row" v-for="(storage, storageIndex) of props.pages" :key="storageIndex">
        <div
            v-for="(page, index) of storage" :key="index"
            :class = "{
                'page': true,
                'selected'  : index === props.selectedPage && storageIndex === props.selectedStorage,
                'swapped'   : page.isSwapped && !page.isFree,
                'allocated' : !page.isFree,
            }"
            @click="$emit('selected', { storageIndex, index })"
        >
            <div class="related-mark" v-show="props.selectedProcess === page.processId"></div>
        </div>
    </div>
    <div class="flex-row" style="gap: 5px; align-items: center;">
        <div class="mark" style="background-color: #b98888;"></div> - page in RAM
        <div class="mark" style="background-color: #8eb4e0;"></div> - page in swap
        <div class="mark" style="background-color: wheat;"></div> - free page
        <div class="mark" style="background-color: #98d;"></div> - selected page
    </div>
</div>
</template>

<style scoped lang='scss'>
.storage {
    gap: 5px;
    width: 100%;
}
.page {
    display: flex;
    flex-direction: column-reverse;
    padding: 2px;

    width: 100%;
    height : 50px;
    background-color: wheat;
    border: 2px solid #0009;
    &:hover {
        border: 2px solid #abf;
    }

    transition: background-color ease 0.3s;
}
.allocated {
    background-color: #b98888;
}
.swapped {
    background-color: #8eb4e0;
}
.selected {
    background-color: #98d;
    border: 2px solid #dee5ff;
}
.related-mark {
    border-radius: 3px;
    width: 100%;
    aspect-ratio: 1;
    background-color: #98d;
    box-shadow: inset 0 0 0 2px #0009;
}
.mark {
    min-height: 20px;
    border-radius: 30%;
    aspect-ratio: 1;
    border: 2px solid #0009;
}
</style>
