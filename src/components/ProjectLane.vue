<script setup>
import { computed } from 'vue';
import { stackProjects } from '../utils/layout';
import ProjectCard from './ProjectCard.vue';

const props = defineProps({
    category: String,
    projects: Array,
    year: Number
});

const emit = defineEmits(['project-click']);


const stackedProjects = computed(() => {
    return stackProjects(props.projects, props.year);
});

// Height depends on number of stacked rows (max 4). 
// 4 rows * 28px = 112px is rough max. 
// We enforce min height.
</script>

<template>
  <div class="relative w-full border-b border-gray-700 bg-gray-900/50 min-h-[40px] hover:bg-gray-800 transition-colors group">
    
    <!-- Category Label (Left Axis) - technically overlay or separate col? -->
    <!-- Requirement: "On the left Y-axis". 
         We can put it sticking to left if we use App.vue layout properly,
         OR just put it here as a sticky element inside the scroll. -->
    
    <!-- We will let App.vue handle the 'Sidebar' vs 'Content' structure.
         This component renders the track content. -->

    <!-- Lane Content -->
    <div class="relative w-full h-full min-h-[116px] py-1">
        <div v-if="projects.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-700 text-xs opacity-0 group-hover:opacity-100 pointer-events-none">
            Click '+ Add' to start
        </div>

        <ProjectCard v-for="p in stackedProjects" :key="p.id || p.title" 
                     :project="p" 
                     @click="$emit('project-click', p)" />
    </div>
  </div>
</template>
