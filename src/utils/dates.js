export const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Get array of months for a given year
export const getMonths = (year) => {
    return MONTH_NAMES.map((name, index) => ({
        name,
        index,
        year
    }));
};

// Get PI Milestones (Quarterly: Jan, Apr, Jul, Oct)
// Assuming PIs start roughly at Q1, Q2, Q3, Q4 starts.
export const getPIMilestones = (year) => {
    // Dates for PI Plannings (approximate start of quarters)
    return [
        new Date(year, 0, 1),  // Jan 1
        new Date(year, 3, 1),  // Apr 1
        new Date(year, 6, 1),  // Jul 1
        new Date(year, 9, 1),  // Oct 1
        new Date(year + 1, 0, 1) // Next Year Jan 1 (End of Q4)
    ];
};

// Calculate percentage position of a date within the year
export const dateToPercent = (dateStr, year) => {
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year + 1, 0, 1).getTime();
    const target = new Date(dateStr).getTime();

    if (isNaN(target)) return 0;

    const totalDuration = endOfYear - startOfYear;
    const position = target - startOfYear;

    let percent = (position / totalDuration) * 100;

    // Clamp
    // percent = Math.max(0, Math.min(100, percent));
    return percent;
};

// Format date for inputs
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
}

// Snap date to nearest PI boundary
export const snapToPI = (dateStr, year) => {
    const target = new Date(dateStr).getTime();
    const boundaries = getPIMilestones(year).map(d => d.getTime());

    // Find closest boundary
    let closest = boundaries[0];
    let minDiff = Math.abs(target - closest);

    for (let i = 1; i < boundaries.length; i++) {
        const diff = Math.abs(target - boundaries[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = boundaries[i];
        }
    }

    return new Date(closest).toISOString().split('T')[0];
};

