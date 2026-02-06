<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    settings: Object
});

const emit = defineEmits(['close', 'save']);

const form = ref({
    theme: 'vibrant',
    categories: [],
    pis: []
});

const activeTab = ref('pis'); // 'pis', 'categories', 'appearance'

watch(() => props.settings, (newVal) => {
    if (newVal) {
        // Deep copy to avoid mutating prop directly
        form.value = JSON.parse(JSON.stringify(newVal));
        
        // Ensure structure
        if (!form.value.pis) form.value.pis = [];
        if (!form.value.categories) form.value.categories = [];
    }
}, { immediate: true, deep: true });

const addPI = () => {
    form.value.pis.push({ name: 'New PI', start: '', end: '' });
};

const removePI = (index) => {
    form.value.pis.splice(index, 1);
};

const addCategory = () => {
    form.value.categories.push("New Category");
};

const removeCategory = (index) => {
    if (confirm("Deleting a category will DELETE all projects in it! Continue?")) {
        form.value.categories.splice(index, 1);
    }
};

const save = () => {
    emit('save', form.value);
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div class="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-700 flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-bold text-white">Roadmap Settings</h3>
              <button @click="$emit('close')" class="text-gray-400 hover:text-white">✕</button>
          </div>

          <!-- Body with Sidebar -->
          <div class="flex flex-1 overflow-hidden">
              <!-- Sidebar -->
              <div class="w-48 bg-gray-900 border-r border-gray-700 p-2 space-y-1">
                  <button @click="activeTab = 'pis'" 
                          class="w-full text-left px-3 py-2 rounded text-sm font-medium"
                          :class="activeTab === 'pis' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'">
                      🗓 PI Planning
                  </button>
                  <button @click="activeTab = 'categories'" 
                          class="w-full text-left px-3 py-2 rounded text-sm font-medium"
                          :class="activeTab === 'categories' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'">
                      📂 Categories
                  </button>
                  <button @click="activeTab = 'appearance'" 
                          class="w-full text-left px-3 py-2 rounded text-sm font-medium"
                          :class="activeTab === 'appearance' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'">
                      🎨 Appearance
                  </button>
              </div>

              <!-- Content -->
              <div class="flex-1 p-6 overflow-y-auto">
                  
                  <!-- PI Tab -->
                  <div v-if="activeTab === 'pis'">
                      <div class="flex justify-between items-center mb-4">
                          <h4 class="text-base font-semibold">Program Increments</h4>
                          <button @click="addPI" class="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">+ Add PI</button>
                      </div>
                      <div class="space-y-3">
                          <div v-for="(pi, idx) in form.pis" :key="idx" class="bg-gray-900 p-3 rounded border border-gray-700 flex flex-col gap-2">
                              <div class="flex justify-between">
                                  <input v-model="pi.name" class="bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none w-1/3 text-sm font-bold" placeholder="PI Name" />
                                  <button @click="removePI(idx)" class="text-red-400 hover:text-red-300 text-xs">Delete</button>
                              </div>
                              <div class="flex gap-2 text-xs">
                                  <div class="flex-1">
                                      <label class="block text-gray-500 mb-0.5">Start</label>
                                      <input type="date" v-model="pi.start" class="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white" />
                                  </div>
                                  <div class="flex-1">
                                      <label class="block text-gray-500 mb-0.5">End</label>
                                      <input type="date" v-model="pi.end" class="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <!-- Categories Tab -->
                  <div v-if="activeTab === 'categories'">
                      <div class="flex justify-between items-center mb-4">
                          <h4 class="text-base font-semibold">Categories</h4>
                          <button @click="addCategory" class="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">+ Add New</button>
                      </div>
                      <div class="space-y-2">
                         <div v-for="(cat, idx) in form.categories" :key="idx" class="flex items-center gap-2">
                             <span class="text-gray-500 text-xs">::</span>
                             <input v-model="form.categories[idx]" class="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" />
                             <button @click="removeCategory(idx)" class="text-gray-500 hover:text-red-400">🗑</button>
                         </div>
                      </div>
                  </div>

                  <!-- Appearance Tab -->
                  <div v-if="activeTab === 'appearance'">
                      <h4 class="text-base font-semibold mb-4">Theme</h4>
                      <div class="space-y-4">
                          <label class="flex items-center space-x-3 cursor-pointer p-3 rounded border border-gray-700 hover:bg-gray-700"
                                 :class="{ 'bg-gray-700 border-blue-500': form.theme === 'business' }">
                              <input type="radio" value="business" v-model="form.theme" class="hidden" />
                              <div class="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                                  <div v-if="form.theme === 'business'" class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                              </div>
                              <div>
                                  <div class="font-bold">Business Classic</div>
                                  <div class="text-xs text-gray-400">Muted colors, professional grey-blue tones.</div>
                              </div>
                          </label>
                          
                          <label class="flex items-center space-x-3 cursor-pointer p-3 rounded border border-gray-700 hover:bg-gray-700"
                                 :class="{ 'bg-gray-700 border-blue-500': form.theme === 'vibrant' }">
                              <input type="radio" value="vibrant" v-model="form.theme" class="hidden" />
                              <div class="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                                  <div v-if="form.theme === 'vibrant'" class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                              </div>
                              <div>
                                  <div class="font-bold">Vibrant Modern</div>
                                  <div class="text-xs text-gray-400">High saturation colors, dark mode default.</div>
                              </div>
                          </label>
                      </div>
                  </div>

              </div>
          </div>
          
          <!-- Footer -->
          <div class="p-4 border-t border-gray-700 flex justify-end space-x-3">
              <button @click="$emit('close')" class="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Cancel</button>
              <button @click="save" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">Save Changes</button>
          </div>
      </div>
  </div>
</template>
