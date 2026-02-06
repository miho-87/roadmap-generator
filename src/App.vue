<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { initGitHub, loadRoadmap, saveRoadmap, createSnapshot, checkUpdates } from './services/github';

import TimelineGrid from './components/TimelineGrid.vue';
import ProjectLane from './components/ProjectLane.vue';
import ProjectModal from './components/ProjectModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import { formatDate, snapToPI } from './utils/dates';
import html2canvas from 'html2canvas';

// CATEGORIES are now dynamic from settings


const token = ref(localStorage.getItem('gh_token') || '');
const repoOwner = ref(localStorage.getItem('gh_owner') || '');
const repoName = ref(localStorage.getItem('gh_repo') || 'roadmap-generator');
const isAuthenticated = ref(false);
const loading = ref(false);
const error = ref('');
const roadmap = ref({ projects: [], meta: { version: 2 }, settings: { categories: [], pis: [], theme: 'vibrant' } });

const activeCategories = computed(() => {
    // Fallback if settings are missing or empty
    if (roadmap.value?.settings?.categories && roadmap.value.settings.categories.length > 0) {
        return roadmap.value.settings.categories;
    }
    return [ "Core Reasoning", "Memory Systems", "Tool Integrations", "Alignment", "Infrastructure", "Frontend", "Analytics", "Research" ];
});

const themeClass = computed(() => {
    return roadmap.value?.settings?.theme === 'business' ? 'theme-business' : 'theme-vibrant';
});

const now = new Date();
const startYear = ref(now.getFullYear());
const startMonth = ref(now.getMonth());

const isPresentationMode = ref(false);

// Modal State

// Modal State
const isModalOpen = ref(false);
const editingProject = ref(null);

const openNewProject = () => {
    editingProject.value = null;
    isModalOpen.value = true;
};

const openEditProject = (project) => {
    if (isPresentationMode.value) return; // Disable edit in presentation
    editingProject.value = { ...project }; 
    isModalOpen.value = true;
};


const handleSave = async (projectData) => {
    if (!roadmap.value?.projects) roadmap.value.projects = [];
    


    if (editingProject.value) {

        // Update existing
        const index = roadmap.value.projects.findIndex(p => p.id === editingProject.value.id);
        if (index !== -1) {
            roadmap.value.projects[index] = { ...editingProject.value, ...projectData };
        }
    } else {
        // Create new
        roadmap.value.projects.push({
            id: crypto.randomUUID(),
            ...projectData
        });
    }
    
    // Save to GitHub if auth
    if (isAuthenticated.value) {
        await saveRoadmap(roadmap.value);
    }
    
    isModalOpen.value = false;
};

const handleDelete = async (project) => {
    if (!project) return;
    roadmap.value.projects = roadmap.value.projects.filter(p => p.id !== project.id);
     
    if (isAuthenticated.value) {
        await saveRoadmap(roadmap.value);
    }
    
    isModalOpen.value = false;
};

const handleSnapshot = async () => {
    const name = prompt("Snapshot Name (e.g. 'Q1-Final'):");
    if (name) {
        try {
            await createSnapshot(name);
            alert("Snapshot created!");
        } catch (e) {
            alert("Snapshot failed: " + e.message);
        }
    }
};



const login = async () => {
  loading.value = true;
  error.value = '';
  const result = await initGitHub(token.value, repoOwner.value, repoName.value);
  
  if (result.success) {
    isAuthenticated.value = true;
    localStorage.setItem('gh_token', token.value);
    localStorage.setItem('gh_owner', repoOwner.value);
    localStorage.setItem('gh_repo', repoName.value);
    
    // Load data
    try {
        roadmap.value = await loadRoadmap();
    } catch (e) {
        error.value = "Failed to load roadmap: " + e.message;
    }
  } else {
    error.value = "Authentication failed. Check your token.";
  }
  loading.value = false;
};

const logout = () => {
    isAuthenticated.value = false;
    token.value = '';
    localStorage.removeItem('gh_token');
};
</script>

<template>
  <div class="bg-gray-900 min-h-screen text-white font-sans">
    
    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="flex flex-col items-center justify-center min-h-screen">
      <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-blue-400">Roadmap Login</h1>
        
        <div class="mb-4">
          <label class="block text-gray-400 text-sm mb-2">GitHub Personal Access Token</label>
          <input v-model="token" type="password" class="w-full bg-gray-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ghp_..." />
          <p class="text-xs text-gray-500 mt-1">Needs 'repo' scope.</p>
        </div>

        <div class="mb-4 flex gap-2">
            <div class="w-1/2">
                <label class="block text-gray-400 text-sm mb-2">Owner (User/Org)</label>
                <input v-model="repoOwner" type="text" class="w-full bg-gray-700 rounded p-2 text-white" placeholder="miho-87" />
            </div>
            <div class="w-1/2">
                <label class="block text-gray-400 text-sm mb-2">Repository</label>
                <input v-model="repoName" type="text" class="w-full bg-gray-700 rounded p-2 text-white" placeholder="roadmap-generator" />
            </div>
        </div>

        <div v-if="error" class="text-red-400 mb-4 text-sm">{{ error }}</div>

        <button @click="login" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
          {{ loading ? 'Connecting...' : 'Connect to GitHub' }}
        </button>
      </div>
    </div>

    <!-- App Content -->
    <div v-else class="p-6 transition-all duration-500 min-h-screen" :class="[{ 'p-0': isPresentationMode }, themeClass]">
        <header v-if="!isPresentationMode" class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold">Roadmap: {{ repoOwner }}/{{ repoName }}</h1>
                <button v-if="hasUpdates" @click="refreshData" class="animate-pulse bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-sm font-bold border border-yellow-500/50">
                    ↻ Updates available
                </button>
            </div>
            <div class="space-x-4">
                 <button @click="handleExport" class="text-sm text-gray-400 hover:text-white">📷 Export</button>
                 <button @click="isSettingsOpen = true" class="text-sm text-gray-400 hover:text-white pointer-events-auto z-50 relative">⚙️ Settings</button>
                 <button @click="handleSnapshot" class="text-sm text-blue-400 hover:text-blue-300">Create Snapshot</button>
                 <button @click="isPresentationMode = true" class="text-sm text-teal-400 hover:text-teal-300">Start Presentation</button>
                 <button @click="logout" class="text-sm text-gray-400 hover:text-white">Logout</button>
            </div>
        </header>

        <div v-if="loading" class="text-center text-gray-400">Loading data...</div>
        
        <div v-else-if="roadmap" id="roadmap-container" class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl transition-all"
             :class="{ 'fixed inset-0 z-[40] rounded-none border-0 h-screen': isPresentationMode }">
             <!-- Toolbar -->
             <div class="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center" v-if="!isPresentationMode">
                 <div class="flex items-center space-x-4">
                    <h2 class="text-lg font-bold">{{ startYear }} / {{ startMonth + 1 }} - View</h2>
                    <button @click="openNewProject" class="px-3 py-1 bg-blue-600 rounded text-sm font-bold hover:bg-blue-500">+ Add Project</button>
                 </div>
                 <!-- Navigation: +/- 1 Year -->
                 <div class="space-x-2">
                     <button @click="startYear--" class="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">Prev Year</button>
                     <button @click="startYear++" class="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">Next Year</button>
                 </div>
             </div>
             
             <!-- Presentation Toolbar overlay -->
             <div v-if="isPresentationMode" class="absolute bottom-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
                 <button @click="isPresentationMode = false" class="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded backdrop-blur font-bold shadow-lg transform transition hover:scale-105">
                     Exit Presentation
                 </button>
             </div>

             <!-- Roadmap View -->
             <div class="flex flex-row min-h-[500px] border-t border-gray-700 relative h-full">
                 
                 <!-- Sidebar (Y-Axis Labels) -->
                 <div class="w-48 flex-shrink-0 bg-gray-800 border-r border-gray-700 z-20 flex flex-col pt-8">
                     <div v-for="cat in activeCategories" :key="cat" class="h-[116px] border-b border-gray-700 flex items-center px-4 text-sm font-semibold text-gray-300">
                         {{ cat }}
                     </div>
                 </div>

                 <!-- Scrollable Content -->
                 <div id="roadmap-view" class="flex-1 relative overflow-x-auto">
                     <div class="min-w-[1000px] h-full relative">
                        <!-- Grid Layer (Background) -->
                        <div class="absolute inset-0 z-0 h-full">
                            <TimelineGrid :startYear="startYear" :startMonth="startMonth" :settings="roadmap.settings" />
                        </div>
                        
                        <!-- Tracks Layer (Foreground) -->
                        <div class="relative z-10 pt-8">
                            <ProjectLane v-for="cat in activeCategories" :key="cat" 
                                :category="cat"
                                :startYear="startYear"
                                :startMonth="startMonth"
                                :projects="roadmap?.projects?.filter(p => p.category === cat) || []"
                                @project-click="openEditProject"
                            />
                        </div>
                     </div>
                 </div>
             </div>
        </div>
        
        <ProjectModal 
            :isOpen="isModalOpen" 
            :project="editingProject"
            :year="startYear" 
            :categories="activeCategories"
            :settings="roadmap.settings"
            @close="isModalOpen = false"
            @save="handleSave"
            @delete="handleDelete"
        />

        <SettingsModal
            :isOpen="isSettingsOpen"
            :settings="roadmap.settings"
            @close="isSettingsOpen = false"
            @save="(newSettings) => { roadmap.settings = newSettings; isSettingsOpen = false; saveRoadmap(roadmap); }"
        />
    </div>


  </div>
</template>
