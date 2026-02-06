# Tech Stack Analyse: GitHub/GitLab Pages & Kollaboration

## Die Herausforderung
GitHub Pages und GitLab Pages sind **statische Hoster**. Das bedeutet, sie liefern nur fertige HTML/JS/CSS-Dateien aus. Sie haben **keine Datenbank** und **kein Backend** im klassischen Sinne, das Daten entgegennehmen und speichern kann.

Das Problem "Gleichzeitiges Bearbeiten & Überschreiben verhindern" erfordert normalerweise einen Server, der die Änderungen koordiniert.

Hier sind die Optionen für einen "einfachen Stack" auf dieser# Tech Stack

## Core Technologies

-   **Frontend Framework:** Vue.js 3 (Composition API)
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS (with utility-first approach)
-   **Programming Language:** JavaScript (ESNext)

## Key Libraries

-   **@octokit/rest:** GitHub API Client (Auth, Repo Access)
-   **html2canvas:** PNG Export functionality

## Architecture

-   **Data Source:** `roadmap.json` hosted in a GitHub Repository.
-   **State Management:** Reactive Vue `ref`s within `App.vue` (Single Store Pattern).
-   **Deployment:** GitHub Pages (Static Hosting).

## Design System

-   **Themes:** CSS Variables for easy theming (Vibrant / Business).
-   **Layout:** CSS Grid & Flexbox.
---

## Option A: "Git als Datenbank" (Serverless / API-First)
Dies ist die eleganteste Lösung, wenn keine externe Datenbank gewünscht ist und alles "in der Familie" (GitHub/GitLab) bleiben soll.

*   **Funktionsweise**:
    1. Die Web-App läuft auf Pages.
    2. Die Daten (die Projekte) liegen als `roadmap.json` direkt im Repository.
    3. Die App nutzt die **GitHub/GitLab API**, um diese Datei zu lesen und zu schreiben.
    4. Zum Speichern authentifiziert sich der User (z.B. via Personal Access Token oder OAuth).
*   **Vorteile**:
    *   **Keine externe Datenbank**: Alles bleibt im Repo.
    *   **Versionshistorie**: Jede Änderung ist ein Git-Commit. Man kann genau sehen, wer wann was geändert hat und zurückrollen ("Time Machine").
    *   **Konfliktlösung**: Git verhindert das blinde Überschreiben. Wenn Kollege A speichert während Kollege B noch editiert, meldet die API einen Konflikt (SHA mismatch). Die App kann dann sagen: "Achtung, Daten wurden im Hintergrund geändert. Bitte neu laden."
*   **Nachteile**:
    *   Nicht echtzeitfähig (kein Live-Cursor wie in Google Docs).
    *   Latenz: Speichern dauert 1-2 Sekunden (API Request -> Commit -> Rebuild nicht unbedingt nötig für Daten, aber Commit dauert kurz).

## Option B: Backend-as-a-Service (Firebase / Supabase)
Man nutzt Pages nur für das Frontend ("die Hülle") und speichert die Daten in einer externen Cloud-Datenbank.

*   **Funktionsweise**:
    *   Frontend auf Pages gehostet.
    *   Datenbank (z.B. Firebase Firestore oder Supabase) speichert die Projekte.
*   **Vorteile**:
    *   **Echtzeit**: Änderungen sind sofort sichtbar ohne Reload.
    *   Handling von Konflikten ist sehr einfach.
*   **Nachteile**:
    *   Zusätzlicher Account / Service nötig (obwohl Free Tiers meist reichen).
    *   Daten liegen "außerhalb" der Versionskontroll-Logik des Repositories (Governance Frage).

## Empfehlung
Für den Wunsch nach "einfachem Stack" und "Verhinderung von Überschreibungen" ist **Option A (Git als Datenbank)** sehr charmant, weil sie keine Drittanbieter benötigt und die Versionskontrolle von Git nutzt, um das PowerPoint-Problem technisch sauber zu lösen.

**Kompromiss**: Es ist kein "Google Docs Live-Coding" Gefühl, sondern eher ein "Laden -> Bearbeiten -> Speichern"-Workflow. Aber es ist 100% sicher gegen versehentliches Überschreiben.
