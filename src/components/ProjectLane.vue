<script setup>
import { computed } from 'vue';
import { stackProjects } from '../utils/layout';
import ProjectCard from './ProjectCard.vue';

const props = defineProps({
    category: String,
    projects: Array,
    startYear: Number,
    startMonth: Number,
    focusState: Object
});

const emit = defineEmits(['project-focus', 'project-edit']);


const stackedProjects = computed(() => {
    return stackProjects(props.projects, props.startYear, props.startMonth);
});

const isLaneDimmed = computed(() => {
    const fs = props.focusState;
    if (!fs.type) return false;
    
    // If category focused, dim if not this category
    if (fs.type === 'category') return fs.id !== props.category;
    
    // If project focused, keep lane visible only if project is inside? 
    // Or simpler: Dim lane background but handle card opacity separately. 
    // Let's just dim the lane wrapper if category is NOT the one (for category focus).
    // For project focus, we might want to keep the lane visible to show context? 
    // User requested "fokussieren... rest dunkel".
    // Let's dim the lane if it doesn't contain the focused project?
    if (fs.type === 'project') {
         // return fs.id.category !== props.category; // Dim lane if project not in it
         return true; // Actually, let's keep all lanes "dimmed" background-wise, but the card will pop.
         // Wait, if I dim the lane div, the card inside will be dimmed too (opacity).
         // Better strategy: Don't dim the container div opacity, but use a greyed out background class?
         // OR: Apply opacity to the *content* of the lane except the focused item.
    }
    
    return false;
});

// Helper to check if a specific project should be dimmed
const isProjectDimmed = (project) => {
    const fs = props.focusState;
    if (!fs.type) return false;
    
    if (fs.type === 'category') {
        // If category focus, project is dimmed if its category is not focused
        // (Handled by isLaneDimmed usually, but if we don't dim parent, we do it here)
        return fs.id !== props.category;
    }
    
    if (fs.type === 'project') {
        // Dim if this is not the focused project
        return fs.id.id !== project.id;
    }
    
    return false;
};

// Lane class
const laneClass = computed(() => {
    if (props.focusState.type === 'category' && props.focusState.id !== props.category) {
        return 'opacity-25 grayscale blur-[1px]';
    }
    // For project focus, we DON'T dim the whole lane, because we want the specific card to be bright.
    // We will dim the siblings.
    if (props.focusState.type === 'project') {
         // If project is in THIS lane, we don't dim the lane. 
         // If project is NOT in this lane, we dim it.
         if (props.focusState.id.category !== props.category) return 'opacity-25 grayscale blur-[1px]';
    }
    return '';
});

</script>

<template>
  <div class="relative w-full border-b border-app-border bg-app-bg/50 h-[148px] hover:bg-app-panel transition-all duration-300 group"
       :class="laneClass">
    
    <!-- Lane Content -->
    <div class="relative w-full h-full min-h-[148px] py-2">
        <div v-if="projects.length === 0" class="absolute inset-0 flex items-center justify-center text-app-muted text-xs opacity-0 group-hover:opacity-100 pointer-events-none">
            Click '+ Add' to start
        </div>

        <ProjectCard v-for="p in stackedProjects" :key="p.id || p.title" 
                     :project="p" 
                     :is-dimmed="isProjectDimmed(p)"
                     @focus="$emit('project-focus', p)" 
                     @edit="$emit('project-edit', p)" />
    </div>
  </div>
</template>
