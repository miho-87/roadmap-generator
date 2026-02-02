import { Octokit } from "octokit";

let octokit = null;
let owner = '';
let repo = '';
let currentSha = null;

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
        const content = atob(response.data.content);
        currentSha = response.data.sha; // Save SHA for updates
        return JSON.parse(content);
    } catch (error) {
        // If file not found (404), return empty roadmap structure
        if (error.status === 404) {
            return { projects: [], meta: { version: 1 } };
        }
        throw error;
    }
};

// Save roadmap.json
export const saveRoadmap = async (roadmapData) => {
    if (!octokit) throw new Error("GitHub not initialized");

    const content = btoa(JSON.stringify(roadmapData, null, 2));

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
            console.error("Conflict detected! Retrieve latest version.");
            return { success: false, error: "CONFLICT" };
        }
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
