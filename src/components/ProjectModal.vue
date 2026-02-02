<script setup>
import { ref, computed, watch } from 'vue';
import { formatDate, snapToPI } from '../utils/dates';

const props = defineProps({
    project: Object, // If null, new project
    year: Number,
    categories: Array,
    isOpen: Boolean
});

const emit = defineEmits(['close', 'save', 'delete']);

const form = ref({
    title: '',
    startDate: '',
    endDate: '',
    category: ''
});

const alignToPI = ref(true);

// Initialize form when opening
watch(() => props.project, (newVal) => {
    if (newVal) {
        form.value = { ...newVal };
    } else {
        // Defaults for new project
        const now = new Date();
        form.value = {
            title: '',
            startDate: formatDate(now),
            endDate: formatDate(new Date(now.setMonth(now.getMonth() + 3))), // +3 months
            category: props.categories[0] || ''
        };
    }
}, { immediate: true });

const save = () => {
    let data = { ...form.value };
    
    if (alignToPI.value) {
        data.startDate = snapToPI(data.startDate, props.year);
        data.endDate = snapToPI(data.endDate, props.year);
    }
    
    emit('save', data);
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg border border-gray-700">
          <h3 class="text-xl font-bold mb-4 text-white">
              {{ project ? 'Edit Project' : 'New Project' }}
          </h3>
          
          <div class="space-y-4">
              <div>
                  <label class="block text-xs uppercase text-gray-500 mb-1">Title</label>
                  <input v-model="form.title" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none" placeholder="Project Name" />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                  <div>
                      <label class="block text-xs uppercase text-gray-500 mb-1">Start Date</label>
                      <input type="date" v-model="form.startDate" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                  </div>
                  <div>
                      <label class="block text-xs uppercase text-gray-500 mb-1">End Date</label>
                      <input type="date" v-model="form.endDate" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                  </div>
              </div>
              
              <div class="flex items-center space-x-2">
                  <input type="checkbox" v-model="alignToPI" id="snap" class="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500">
                  <label for="snap" class="text-sm text-gray-300">Align to PI (Snap to Quarter)</label>
              </div>
              
              <div>
                  <label class="block text-xs uppercase text-gray-500 mb-1">Category</label>
                  <select v-model="form.category" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                      <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
              </div>
          </div>
          
          <div class="mt-8 flex justify-between">
              <button v-if="project" @click="$emit('delete', project)" class="text-red-400 hover:text-red-300 text-sm font-semibold">Delete Project</button>
              <div v-else></div> <!-- Spacer -->
              
              <div class="space-x-3">
                  <button @click="$emit('close')" class="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Cancel</button>
                  <button @click="save" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">Save Changes</button>
              </div>
          </div>
      </div>
  </div>
</template>
