export const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Get array of months for a dynamic year (starts at startMonth)
// startMonth: 0-11
export const getMonths = (year, startMonth = 0) => {
    let months = [];

    // We want 12 months starting from year/startMonth
    for (let i = 0; i < 12; i++) {
        let mIndex = (startMonth + i) % 12;
        let mYear = year + Math.floor((startMonth + i) / 12);

        months.push({
            name: MONTH_NAMES[mIndex],
            index: mIndex,
            year: mYear
        });
    }
    return months;
};

// Get PI Milestones from Settings
export const getPIMilestones = (settings) => {
    if (!settings || !settings.pis) return [];

    return settings.pis.map(pi => ({
        label: pi.name,
        date: new Date(pi.start) // Align line to start date
    }));
};

// Calculate percentage position of a date within the DYNAMIC year
export const dateToPercent = (dateStr, startYear, startMonth) => {
    const startOfPeriod = new Date(startYear, startMonth, 1).getTime();
    // End is 12 months later
    const endOfPeriod = new Date(startYear, startMonth + 12, 1).getTime();

    const target = new Date(dateStr).getTime();

    if (isNaN(target)) return 0;

    const totalDuration = endOfPeriod - startOfPeriod;
    const position = target - startOfPeriod;

    let percent = (position / totalDuration) * 100;

    return percent;
};

// Snap date to nearest PI boundary (Start or End)
export const snapToPI = (dateStr, settings) => {
    if (!settings?.pis || settings.pis.length === 0) return dateStr;

    const target = new Date(dateStr).getTime();
    let candidates = [];

    settings.pis.forEach(pi => {
        candidates.push(new Date(pi.start).getTime());
        candidates.push(new Date(pi.end).getTime());
    });

    // Find closest boundary
    let closest = candidates[0];
    let minDiff = Math.abs(target - closest);

    for (let i = 1; i < candidates.length; i++) {
        const diff = Math.abs(target - candidates[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = candidates[i];
        }
    }

    return new Date(closest).toISOString().split('T')[0];
};

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
}
