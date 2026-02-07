import { Octokit } from "octokit";

let octokit = null;
let owner = '';
let repo = '';
let currentSha = null;

// UTF-8 Clean Base64 Helpers
const toBase64 = (str) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
};

const fromBase64 = (str) => {
    // Clean input (remove newlines/whitespace)
    const cleanStr = str.replace(/\s/g, '');
    return decodeURIComponent(atob(cleanStr).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

const DEFAULT_SETTINGS = {
    theme: 'vibrant',
    categories: ["Core Reasoning", "Memory Systems", "Tool Integrations", "Alignment", "Infrastructure", "Frontend", "Analytics", "Research"],
    pis: [] // Will be populated dynamically if empty
};

// Initialize Octokit with user token and repo details
export const initGitHub = async (token, repoOwner, repoName) => {

    try {
        octokit = new Octokit({ auth: token });
        owner = repoOwner;
        repo = repoName;

        // Verify token by getting user data
        const { data } = await octokit.rest.users.getAuthenticated();
        return { success: true, user: data };
    } catch (error) {
        console.error("GitHub Auth Failed:", error);
        return { success: false, error };
    }
};

// Load roadmap.json from the repository
export const loadRoadmap = async () => {
    if (!octokit) throw new Error("GitHub not initialized");

    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: "roadmap.json",
        });

        // Content is base64 encoded
        let content;
        try {
            content = fromBase64(response.data.content);
        } catch (e) {
            console.warn("UTF-8 decoding failed, attempting legacy decode...", e);
            content = atob(response.data.content);
        }
        currentSha = response.data.sha; // Save SHA for updates

        const data = JSON.parse(content);

        // Ensure settings exist
        if (!data.settings) data.settings = {};
        data.settings = { ...DEFAULT_SETTINGS, ...data.settings };

        return data;
    } catch (error) {
        // If file not found (404), return empty roadmap structure with defaults
        if (error.status === 404) {
            return {
                projects: [],
                meta: { version: 2 },
                settings: { ...DEFAULT_SETTINGS }
            };
        }
        throw error;
    }
};

// Check for updates (Head SHA)
export const checkUpdates = async () => {
    if (!octokit) return false;
    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: "roadmap.json",
        });
        return response.data.sha !== currentSha;
    } catch (e) {
        return false;
    }
};


// Save roadmap.json
export const saveRoadmap = async (roadmapData) => {
    if (!octokit) throw new Error("GitHub not initialized");

    const content = toBase64(JSON.stringify(roadmapData, null, 2));

    try {
        const response = await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: "roadmap.json",
            message: "Update roadmap data",
            content,
            sha: currentSha, // Required for updates (prevents overwrites if changed)
        });

        currentSha = response.data.content.sha; // Update SHA
        return { success: true };
    } catch (error) {
        if (error.status === 409) {
            console.warn("Conflict detected! Fetching latest SHA and retrying...");
            // Fetch latest SHA
            try {
                const { data } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: "roadmap.json",
                });
                currentSha = data.sha;

                // Retry the save operation recursively (once)
                // Note: This overwrites remote changes with local state (Last Write Wins)
                return await saveRoadmap(roadmapData);
            } catch (retryError) {
                console.error("Retry failed:", retryError);
                return { success: false, error: "RETRY_FAILED" };
            }
        }
        console.error("Save failed:", error);
        throw error;
    }
};

// Create a snapshot (copy) of the current roadmap
export const createSnapshot = async (name) => {
    if (!octokit) throw new Error("GitHub not initialized");

    try {
        // 1. Get current content
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: "roadmap.json",
        });

        // 2. Write to new file (e.g., snapshots/roadmap_2023-10-26.json)
        // Ensure snapshots execution
        const path = `snapshots/roadmap_${name}.json`;

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Create snapshot: ${name}`,
            content: data.content, // Copy existing base64 content
        });

        return { success: true, path };
    } catch (error) {
        console.error("Snapshot failed:", error);
        throw error;
    }
};

// List available snapshots
export const listSnapshots = async () => {
    if (!octokit) return [];

    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: "snapshots",
            headers: {
                "If-None-Match": "" // Force fresh fetch, bypass cache
            }
        });

        // Filter valid json files
        return response.data
            .filter(file => file.name.startsWith('roadmap_') && file.name.endsWith('.json'))
            .map(file => ({
                name: file.name.replace('roadmap_', '').replace('.json', ''),
                path: file.path,
                sha: file.sha
            }));
    } catch (error) {
        // Folder might not exist yet
        if (error.status === 404) return [];
        console.error("Failed to list snapshots:", error);
        return [];
    }
};

// Load a specific snapshot (Read Only usually)
export const loadSnapshot = async (path) => {
    if (!octokit) throw new Error("GitHub not initialized");

    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        const content = fromBase64(response.data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error("Failed to load snapshot:", error);
        throw error;
    }
};
