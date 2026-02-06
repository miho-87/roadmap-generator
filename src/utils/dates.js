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

// Snap date to nearest PI Start
export const snapToPIStart = (dateStr, settings) => {
    if (!settings?.pis || settings.pis.length === 0) return dateStr;

    const target = new Date(dateStr).getTime();
    let closest = null;
    let minDiff = Infinity;

    settings.pis.forEach(pi => {
        const start = new Date(pi.start).getTime();
        const diff = Math.abs(target - start);
        if (diff < minDiff) {
            minDiff = diff;
            closest = pi.start;
        }
    });

    return closest ? new Date(closest).toISOString().split('T')[0] : dateStr;
};

// Snap date to nearest PI End (with optional 1 week buffer)
export const snapToPIEnd = (dateStr, settings, withBuffer = false) => {
    if (!settings?.pis || settings.pis.length === 0) return dateStr;

    const target = new Date(dateStr).getTime();
    let closest = null;
    let minDiff = Infinity;

    settings.pis.forEach(pi => {
        const end = new Date(pi.end).getTime();
        const diff = Math.abs(target - end);
        if (diff < minDiff) {
            minDiff = diff;
            closest = pi.end;
        }
    });

    if (!closest) return dateStr;

    const finalDate = new Date(closest);
    if (withBuffer) {
        finalDate.setDate(finalDate.getDate() - 7); // 1 week buffer
    }

    return finalDate.toISOString().split('T')[0];
};

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
}
