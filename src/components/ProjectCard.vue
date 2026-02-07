<script setup>
import { computed } from 'vue';

const props = defineProps({
    project: Object,
    isDimmed: Boolean
});

const style = computed(() => {
    return {
        left: props.project._pos.left + '%',
        width: props.project._pos.width + '%',
        top: (props.project._row * 36) + 4 + 'px' // 36px height per row (32px card + 4px gap)
    };
});

// Vibrant colors based on something (e.g., hash or category)
const colors = [
    'bg-track-blue hover:brightness-110',
    'bg-track-purple hover:brightness-110',
    'bg-track-green hover:brightness-110',
    'bg-track-orange hover:brightness-110',
    'bg-track-pink hover:brightness-110',
    'bg-track-teal hover:brightness-110',
    'bg-track-indigo hover:brightness-110',
    'bg-track-red hover:brightness-110'
];
const colorClass = computed(() => {
    // Simple pseudo-random color based on title length or char
    const idx = (props.project.title?.length || 0) % colors.length;
    return colors[idx];
});
</script>

<template>
  <div class="absolute h-8 rounded text-sm font-medium text-track-text px-3 py-1 whitespace-nowrap overflow-hidden cursor-pointer shadow-md border border-white/20 transition-all duration-300 z-20 flex items-center"
       :class="[
            colorClass, 
            isDimmed ? 'opacity-25 grayscale blur-[0.5px]' : 'hover:scale-[1.01] hover:shadow-lg hover:z-30'
       ]"
       :style="style"
       :title="project.title + ' (' + project.startDate + ' - ' + project.endDate + ')'"
       @click.stop="$emit('focus')"
       @dblclick.stop="$emit('edit')">
       {{ project.title }}
  </div>
</template>
