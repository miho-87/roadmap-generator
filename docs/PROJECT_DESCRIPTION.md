# Roadmap Generator - Project Description

## Zielsetzung
Das Ziel des Projekts ist die Entwicklung eines Systems zur Erstellung von Roadmaps. Die Roadmap soll standardmäßig einen Zeitraum von einem Jahr abbilden und ein monatsweises Raster anzeigen.

## Kernfunktionen

### Visualisierung
- **Zeitraum**: Die Roadmap bildet dynamisch einen Zeitraum von einem Jahr ab, beginnend beim aktuellen Monat (z.B. Feb 2026 - Jan 2027).
- **Raster**: Die Standardansicht nutzt ein monatsweises Raster.
- **X-Achse**: Bildet die Zeit ab (Jahresansicht, monatsweise).
- **Y-Achse**: Gruppiert Projekte nach Überprojekten (Kategorien/Buckets), welche vom Nutzer frei konfigurier- und sortierbar sind.
- **Layout innerhalb Gruppe**:
    - Zeitlich folgende Projekte stehen nebeneinander (bis zu 4 sichtbar im Viewport).
    - Zeitlich überlappende Projekte werden gestapelt.
    - **Maximale Stapelhöhe**: Bis zu 4 Projekte übereinander innerhalb einer Gruppe.

### Projekte
- **Definition**: Projekte werden durch **Titel**, Start- und Enddatum definiert.
- **Darstellung**: Grafisch korrekte Anzeige als Balken auf der Zeitachse (inkl. Titel).
- **Ausrichtung**: Projekte sollen sich komfortabel am Planungsraster (SAFe) ausrichten lassen.
- **Flexibilität**: Projekte können das Standardraster überragen (früherer Start oder späteres Ende möglich).

### SAFe Planungsraster (Scaled Agile Framework)
- **PI Planning**: Findet 4-mal im Jahr statt.
- **Milestones**: Die Roadmap zeigt 4 Standard-Meilensteine für die PI Plannings an.
- **Program Increments (PIs)**: Die Zeiträume zwischen den PI Plannings.
- **Standard-Projektlaufzeit**: In der Regel vom Start eines PIs bis eine Woche vor dessen Ende.

## Anforderungen an die Bedienung
- Einfache "Snap-to-Grid" oder Ausrichtungsfunktionalität für Projekte basierend auf den PI-Zeiträumen.
- Manuelle Anpassungsmöglichkeiten für Projekte, die von der Regel abweichen.
- **PI-Planung**: Konfigurierbare PI-Termine (4x pro Jahr) und PI-Namen (z.B. "PI 2026.11").
- **Kategorien-Verwaltung**: Hinzufügen, Umbenennen und Löschen von Kategorien. Sicherheitsabfrage beim Löschen (Löschen einer Kategorie löscht auch alle darin enthaltenen Projekte).

## Design & Export
- **Farbschema**: Standard ist ein "Business/Classic" Schema (nüchterne, professionelle Farben: Blau, Schiefer, Grau). Das bisherige "Vibrant" Schema bleibt optional wählbar.
- **Export**: Funktion zum Exportieren der Roadmap als Bild oder PDF.
- **Präsentationsmodus**: Navigation zurück in den Editiermodus ("Back to Edit") muss möglich sein.

## Kollaboration und Datenintegrität (Neu)
- **Auto-Refresh**: Automatische Synchronisierung der Projektdaten aus dem Repository bei Änderungen durch andere (polling oder event-basiert) und nach eigenen Änderungen.
- **Problemstellung**: Aktuell wird eine geteilte PowerPoint-Datei verwendet. Wenn mehrere Personen gleichzeitig editieren, kommt es zu Speicherkonflikten und Datenverlust.
- **Anforderung**: Das System muss gleichzeitiges Arbeiten ermöglichen oder zumindest Speicherkonflikte verhindern.

## Historisierung & Planungszyklen
- **Planungszyklus**: Roadmap-Planungssessions finden ca. alle 6 Wochen statt.
- **Historisierung**: Es muss möglich sein, eine Kopie ("Snapshot") des vorherigen Standes zu erstellen, um eine Historie der Planungen abzubilden.
