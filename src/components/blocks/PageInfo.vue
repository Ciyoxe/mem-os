<script setup lang="ts">
import { Page     } from '@/modules/Page';
import { asBits   } from '@/modules/Utilities';
import { computed } from 'vue';

const props = defineProps<{
    "maskLength" : number,
    "oldCounter" : number,
    "processId"  : number,
    "rBit"       : number,
    "isSwapped"  : boolean,
}>();
const oldCounterBits = computed(()=> asBits(props.oldCounter).padStart(props.maskLength, '0'));
const processId = computed(()=>props.processId >= 0 ? props.processId : "No");
const swapped = computed(()=> props.isSwapped ? "Yes" : "No");
</script>

<template>
<div class="page-info flex-col">
    <template v-if="props.maskLength > 0">
        <div class="flex-row">
            <div class="info-title">Old counter:</div> {{ oldCounterBits }}
        </div>
        <div class="flex-row">
            <div class="info-title">R bit:</div> {{ props.rBit }}
        </div>
        <div class="flex-row">
            <div class="info-title">Process id:</div> {{ processId }}
        </div>
        <div class="flex-row">
            <div class="info-title">Swapped:</div> {{ swapped }}
        </div>
    </template>
    <template v-else>
        No selected page
    </template>
</div>
</template>

<style scoped lang="scss">
    .page-info {
        gap: 10px;
        min-width: 245px;
        min-height: 300px;

        border-radius: 10px;
        border: 2px solid #0009;
        padding: 10px;
    }
    .info-title {
        display: inline-block;
        width: 120px;
    }
</style>
