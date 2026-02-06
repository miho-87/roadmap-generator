<script setup>
import { computed } from 'vue';

const props = defineProps({
    project: Object
});

const style = computed(() => {
    return {
        left: props.project._pos.left + '%',
        width: props.project._pos.width + '%',
        top: (props.project._row * 28) + 4 + 'px' // 28px height per row
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
  <div class="absolute h-6 rounded text-xs text-white px-2 py-0.5 whitespace-nowrap overflow-hidden cursor-pointer shadow transition-all z-20 flex items-center"
       :class="colorClass"
       :style="style"
       :title="project.title + ' (' + project.startDate + ' - ' + project.endDate + ')'">
       {{ project.title }}
  </div>
</template>
