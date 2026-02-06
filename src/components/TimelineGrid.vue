<script setup>
import { computed } from 'vue';
import { getMonths, getPIMilestones, dateToPercent, MONTH_NAMES } from '../utils/dates';

const props = defineProps({
    startYear: Number,
    startMonth: Number, // 0-11
    settings: Object
});

const months = computed(() => getMonths(props.startYear, props.startMonth));

const piLines = computed(() => {
    return getPIMilestones(props.settings).map(pi => {
        const percent = dateToPercent(pi.date, props.startYear, props.startMonth);
        
        // Filter out of bounds (0-100%)
        if (percent < 0 || percent > 100) return null;

        return {
            left: percent + '%',
            label: pi.label
        };
    }).filter(Boolean);
});


</script>

<template>
  <div class="relative w-full h-full border-b border-app-border">
    <!-- Month Headers -->
    <div class="flex w-full h-8 text-xs text-app-muted border-b border-app-border bg-app-header">
        <div v-for="month in months" :key="month.name" class="flex-1 border-r border-app-border flex items-center justify-center">
            {{ month.name }}
        </div>
    </div>

    <!-- Grid Background Lines (Optional, maybe handled by parent track components) -->
    
    <!-- PI Milestones -->
    <div v-for="(pi, idx) in piLines" :key="idx" 
         class="absolute top-0 bottom-0 border-l-2 border-blue-500/50 z-10 pointer-events-none"
         :style="{ left: pi.left }">
         <div class="absolute top-0 left-1 text-[10px] text-blue-500 font-bold opacity-90 whitespace-nowrap bg-app-header/80 px-1 rounded shadow-sm border border-blue-200/20 z-20">
             {{ pi.label }}
         </div>
    </div>
  </div>
</template>
