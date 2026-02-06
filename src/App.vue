<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { initGitHub, loadRoadmap, saveRoadmap, createSnapshot, checkUpdates, listSnapshots, loadSnapshot } from './services/github';

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

const isSettingsOpen = ref(false);
const hasUpdates = ref(false);

const themeClass = computed(() => {
    return roadmap.value?.settings?.theme === 'business' ? 'theme-business' : 'theme-vibrant';
});

// Apply theme to body for global variables
watch(themeClass, (newVal) => {
    document.body.className = newVal;
}, { immediate: true });

const now = new Date();
const startYear = ref(now.getFullYear());
const startMonth = ref(now.getMonth());

const isPresentationMode = ref(false);

// Snapshot State
const isSnapshotMode = ref(false);
const currentSnapshotName = ref('');
const showSnapshotModal = ref(false);
const availableSnapshots = ref([]);

const openSnapshotBrowser = async () => {
    loading.value = true;
    availableSnapshots.value = await listSnapshots();
    loading.value = false;
    showSnapshotModal.value = true;
};

const navigateMonth = (delta) => {
    let newMonth = startMonth.value + delta;
    if (newMonth < 0) {
        startMonth.value = 11;
        startYear.value--;
    } else if (newMonth > 11) {
        startMonth.value = 0;
        startYear.value++;
    } else {
        startMonth.value = newMonth;
    }
};

const loadSelectedSnapshot = async (snapshot) => {
    loading.value = true;
    try {
        const data = await loadSnapshot(snapshot.path);
        // Normalize settings if missing
        if (!data.settings) data.settings = { categories: [], pis: [], theme: 'vibrant' };
        
        roadmap.value = data;
        isSnapshotMode.value = true;
        currentSnapshotName.value = snapshot.name;
        showSnapshotModal.value = false;
    } catch (e) {
        alert("Failed to load snapshot: " + e.message);
    }
    loading.value = false;
};

const exitSnapshotMode = async () => {
    loading.value = true;
    isSnapshotMode.value = false;
    currentSnapshotName.value = '';
    // Reload live data
    roadmap.value = await loadRoadmap();
    loading.value = false;
};

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

const handleExport = async () => {
    const el = document.getElementById('roadmap-container');
    if (!el) return;
    
    // Temporarily remove fixed positioning if in presentation mode for full capture
    const wasPresentation = isPresentationMode.value;
    if (wasPresentation) {
        // Wait for UI to update if we needed to change state (optional strategy)
    }

    try {
        const canvas = await html2canvas(el, {
            backgroundColor: '#1f2937', // Match bg-gray-800
            scale: 2, // Higher resolution
            logging: false,
            useCORS: true
        });

        const link = document.createElement('a');
        link.download = `roadmap-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Export failed. See console for details.");
    }
};

const currentViewDate = computed(() => {
    return new Date(startYear.value, startMonth.value).toLocaleString('de-DE', { month: 'long', year: 'numeric' });
});
</script>

<template>
<div class="min-h-screen text-app-text font-sans transition-colors duration-300">
    
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
    <div v-else class="p-6 transition-all duration-500 min-h-screen" :class="{ 'p-0': isPresentationMode }">
        <header v-if="!isPresentationMode" class="flex justify-between items-center mb-6 bg-app-header p-4 rounded shadow-sm border border-app-border">
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold">Roadmap: {{ repoOwner }}/{{ repoName }}</h1>
                <div v-if="isSnapshotMode" class="px-3 py-1 bg-purple-600 rounded text-sm font-bold flex items-center gap-2 animate-pulse">
                    <span>👁 Viewing Snapshot: {{ currentSnapshotName }}</span>
                    <button @click="exitSnapshotMode" class="bg-white text-purple-900 px-2 rounded-sm text-xs hover:bg-gray-200">Exit (Return to Live)</button>
                </div>
                <button v-else-if="hasUpdates" @click="refreshData" class="animate-pulse bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-sm font-bold border border-yellow-500/50">
                    ↻ Updates available
                </button>
            </div>
            <div class="space-x-4">
                 <button @click="handleExport" class="text-sm text-app-muted hover:text-app-text">📷 Export</button>
                 
                 <template v-if="!isSnapshotMode">
                     <button @click="isSettingsOpen = true" class="text-sm text-app-muted hover:text-app-text pointer-events-auto z-50 relative">⚙️ Settings</button>
                     <button @click="handleSnapshot" class="text-sm text-blue-400 hover:text-blue-300">Create Snapshot</button>
                     <button @click="openSnapshotBrowser" class="text-sm text-purple-400 hover:text-purple-300">📂 Snapshots</button>
                 </template>
                 
                 <button @click="isPresentationMode = true" class="text-sm text-teal-400 hover:text-teal-300">Start Presentation</button>
                 <button @click="logout" class="text-sm text-gray-400 hover:text-white">Logout</button>
            </div>
        </header>

        <div v-if="loading" class="text-center text-app-muted">Loading data...</div>
        
        <div v-else-if="roadmap" id="roadmap-container" class="bg-app-panel rounded-lg overflow-hidden border border-app-border shadow-xl transition-all"
             :class="{ 'fixed inset-0 z-[40] rounded-none border-0 h-screen': isPresentationMode }">
             <div class="p-4 bg-app-header border-b border-app-border flex justify-between items-center" v-if="!isPresentationMode">
                 <div class="flex items-center space-x-4">
                    <h2 class="text-lg font-bold capitalize">{{ currentViewDate }}</h2>
                    <button @click="openNewProject" class="px-3 py-1 bg-blue-600 rounded text-sm font-bold hover:bg-blue-500 text-white shadow">+ Add Project</button>
                 </div>
                  <!-- Navigation: +/- 1 Month -->
                  <div class="space-x-2">
                      <button @click="navigateMonth(-1)" class="px-2 py-1 bg-app-bg border border-app-border rounded text-xs hover:bg-app-panel text-app-muted hover:text-app-text">Prev Month</button>
                      <button @click="navigateMonth(1)" class="px-2 py-1 bg-app-bg border border-app-border rounded text-xs hover:bg-app-panel text-app-muted hover:text-app-text">Next Month</button>
                  </div>
             </div>
             
             <!-- Presentation Toolbar overlay -->
             <div v-if="isPresentationMode" class="absolute bottom-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
                 <button @click="isPresentationMode = false" class="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded backdrop-blur font-bold shadow-lg transform transition hover:scale-105">
                     Exit Presentation
                 </button>
             </div>

             <!-- Roadmap View (Unified Scroll Container) -->
             <div id="roadmap-view" class="flex-1 relative overflow-auto border-t border-app-border h-[calc(100vh-200px)]">
                 <div class="flex min-w-[max-content] h-full relative">
                    
                     <!-- Sidebar (Sticky Left) -->
                     <div class="w-48 flex-shrink-0 bg-app-header border-r border-app-border z-30 sticky left-0 shadow-lg">
                         <div class="h-8 border-b border-app-border bg-app-bg/50"></div> <!-- Spacer matches Month Header (h-8) -->
                         <div class="h-8 border-b border-app-border bg-app-header flex items-center justify-center text-xs font-bold text-app-muted">
                             Category
                         </div>
                         <div v-for="cat in activeCategories" :key="cat" class="h-[148px] border-b border-app-border flex items-center px-4 text-sm font-semibold text-app-muted bg-app-header">
                             {{ cat }}
                         </div>
                     </div>

                     <!-- Timeline Content -->
                     <div class="min-w-[1000px] flex-1 relative">
                        <!-- Grid Layer (Background) -->
                        <div class="absolute inset-0 z-0 h-full">
                            <TimelineGrid :startYear="startYear" :startMonth="startMonth" :settings="roadmap.settings" />
                        </div>
                        
                        <!-- Tracks Layer (Foreground) -->
                        <div class="relative z-10 pt-16">
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

        <!-- Snapshot Browser Modal -->
        <div v-if="showSnapshotModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div class="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-700 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">📂 Load Snapshot</h3>
                    <button @click="showSnapshotModal = false" class="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div v-if="availableSnapshots.length === 0" class="text-gray-400 text-center py-4">
                    No snapshots found.
                </div>
                
                <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                    <button v-for="s in availableSnapshots" :key="s.path" 
                        @click="loadSelectedSnapshot(s)"
                        class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center group">
                        <span class="font-mono text-sm text-blue-300">{{ s.name }}</span>
                        <span class="text-xs text-gray-400 group-hover:text-white">Load →</span>
                    </button>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-700 text-center">
                    <button @click="showSnapshotModal = false" class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
                </div>
            </div>
        </div>
    </div>


  </div>
</template>
