# Roadmap Generator - Project Description

## Zielsetzung
Das Ziel des Projekts ist die Entwicklung eines Systems zur Erstellung von Roadmaps. Die Roadmap soll standardmäßig einen Zeitraum von einem Jahr abbilden und ein monatsweises Raster anzeigen.

## Kernfunktionen

### Visualisierung
- **Zeitraum**: Die Roadmap deckt standardmäßig ein Jahr ab.
- **Raster**: Die Standardansicht nutzt ein monatsweises Raster.
- **X-Achse**: Bildet die Zeit ab (Jahresansicht, monatsweise).
- **Y-Achse**: Gruppiert Projekte nach Überprojekten (Kategorien/Buckets). Es sollen ca. **8 Gruppen** angezeigt werden.
- **Layout innerhalb Gruppe**:
    - Zeitlich folgende Projekte stehen nebeneinander (bis zu 4 sichtbar im Viewport).
    - Zeitlich überlappende Projekte werden gestapelt.
    - **Maximale Stapelhöhe**: Bis zu 4 Projekte übereinander innerhalb einer Gruppe.

### Projekte

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

## Bedienung & Workflows

### 1. Initiale Erstellung & Projekte verwalten
- **Add-Flow**: Schnelles Hinzufügen von Projekten direkt in der Zeile ("Click to Add") oder über einen "Neues Projekt" Button.
- **Editor**: Ein Modal oder Seitenleiste ("Project Details") zur Eingabe von Titel, Start/Ende und Gruppe.
- **Komfort**: 
    - "Smart Defaults": Start/Ende werden automatisch auf das aktuelle PI gesetzt.
    - Drag & Drop zum Verschieben zwischen Gruppen oder Zeiträumen.

### 2. Regelmäßige Überplanung (Re-Planning)
Da dies alle 6 Wochen geschieht, muss der Prozess effizient sein:
- **Basis**: Start mit einer Kopie des letzten Standes (siehe Historisierung).
- **Visuelles Feedback**: Man sieht sofort, wo Projekte sich überschneiden oder Lücken entstehen.
- **Bulk-Actions**: Projekte können einfach verlängert oder verschoben werden.
- **Löschen**: Schnelles Entfernen von Projekten, die nicht mehr relevant sind.

### 3. Präsentation & Management
- **Präsentations-Modus**: Eine bereinigte Ansicht ohne Bearbeitungs-Icons ("Read-Only").
- **Fokus**: Maximale Lesbarkeit für Beamer/Screen-Sharing (größere Schrift, hoher Kontrast).
- **Export**: Möglichkeit, die Ansicht als statisches Bild (PNG) oder PDF zu exportieren, um sie in Folien einzubetten (falls PowerPoint unumgänglich ist).


## Kollaboration und Datenintegrität (Neu)
- **Problemstellung**: Aktuell wird eine geteilte PowerPoint-Datei verwendet. Wenn mehrere Personen gleichzeitig editieren, kommt es zu Speicherkonflikten und Datenverlust (gegenseitiges Überschreiben).
- **Anforderung**: Das System muss gleichzeitiges Arbeiten ermöglichen oder zumindest Speicherkonflikte verhindern ("Last write wins" darf nicht blind passieren).
- **Ziel**: Eine "Single Source of Truth", die sicherstellt, dass Änderungen von Kollegen nicht versehentlich verloren gehen.

## Historisierung & Planungszyklen
- **Planungszyklus**: Roadmap-Planungssessions finden ca. alle 6 Wochen statt.
- **Historisierung**: Es muss möglich sein, eine Kopie ("Snapshot") des vorherigen Standes zu erstellen, um eine Historie der Planungen abzubilden.
- **Workflow**:
    - Neue Planung startet auf Basis der Kopie des letzten Standes (nicht bei Null).
    - Während der Planung werden bestehende Projekte verschoben (Termine geändert), neue hinzugefügt oder obsolete entfernt.


