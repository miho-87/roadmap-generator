# Roadmap Generator

A Vue.js based application to visualize and manage product roadmaps with SAFe (Scaled Agile Framework) support.

## Features

-   **Interactive Timeline:** Scrollable roadmap with dynamic month/year navigation.
-   **SAFe Support:** Dedicated PI (Program Increment) grid and alignment tools.
-   **Project Management:** Create, edit, and simple drag-and-drop (planned) projects.
-   **Dynamic Configuration:** Customize categories and PI milestones via `roadmap.json`.
-   **GitHub Integration:**
    -   Auto-load/save `roadmap.json` from a GitHub repository.
    -   Snapshot system to version roadmaps (e.g., "Draft Q1", "Final Q2").
-   **Export:** High-quality PNG export (16:10 aspect ratio) for presentations.
-   **Business Theme:** Professional "Dark Mode" (Business Classic) with high contrast.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Locally:**
    ```bash
    npm run dev
    ```

3.  **Build:**
    ```bash
    npm run build
    ```

## Configuration (roadmap.json)

The application relies on a `roadmap.json` file stored in your GitHub repository.

```json
{
  "settings": {
    "categories": ["Core", "Frontend", "Backend"],
    "pis": [
      { "name": "PI 2026.1", "start": "2026-02-01", "end": "2026-04-30" }
    ]
  },
  "projects": [
    {
      "id": "uuid",
      "title": "Project Alpha",
      "startDate": "2026-02-15",
      "endDate": "2026-04-20",
      "category": "Core"
    }
  ]
}
```

## Special Features

### Align to PI
When editing a project, the "Align to PI" checkbox enforces:
-   **Start Date:** Snaps correctly to the start of the nearest PI.
-   **End Date:** Snaps to the end of the nearest PI **minus 1 week** (Buffer/Review Phase).

### Snapshots
You can save the current state as a snapshot (stored in `snapshots/` folder in repo). The list is always fetched live from GitHub to ensure you see the latest versions.

### Encoding
The application handles special characters (UTF-8, Umlaute) correctly for German and international support.
