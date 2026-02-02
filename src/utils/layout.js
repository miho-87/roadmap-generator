import { dateToPercent } from './dates';

// Calculate start and width percentages for projects
export const calculateProjectPosition = (project, year) => {
    const start = dateToPercent(project.startDate, year);
    const end = dateToPercent(project.endDate, year);
    const width = Math.max(end - start, 0.5); // Minimum width

    return {
        left: start,
        width,
        right: start + width
    };
};

// Stack projects to avoid overlap
// Returns array of projects with 'row' property (0-3)
export const stackProjects = (projects, year) => {
    if (!projects || projects.length === 0) return [];

    // Sort by start date
    const sorted = [...projects].sort((a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
    );

    // Track end times for each row
    const rows = [];
    // rows[0] = endPercent of last project in row 0

    return sorted.map(project => {
        const pos = calculateProjectPosition(project, year);

        let assignedRow = -1;

        // Find first row where this project fits
        for (let i = 0; i < rows.length; i++) {
            // If project starts after the last project in this row ends (plus buffer)
            if (pos.left >= rows[i] + 1) { // 1% gap
                assignedRow = i;
                rows[i] = pos.right;
                break;
            }
        }

        // If no row found, create new one
        if (assignedRow === -1) {
            assignedRow = rows.length;
            rows.push(pos.right);
        }

        // Max 4 rows (0-3)
        // If row > 3, we might need to hide or show collision
        // Requirement said "Max stack height up to 4"

        return {
            ...project,
            _pos: pos,
            _row: assignedRow
        };
    });
};
