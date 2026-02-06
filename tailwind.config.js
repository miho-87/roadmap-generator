/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                app: {
                    bg: 'var(--bg-app)',
                    panel: 'var(--bg-panel)',
                    header: 'var(--bg-header)',
                    border: 'var(--border-color)',
                    text: 'var(--text-primary)',
                    muted: 'var(--text-muted)',
                    muted: 'var(--text-muted)',
                    accent: 'var(--text-accent)',
                },
                input: {
                    bg: 'var(--bg-input)',
                    text: 'var(--text-input)',
                    border: 'var(--border-input)',
                },
                track: {
                    blue: 'var(--track-blue)',
                    purple: 'var(--track-purple)',
                    green: 'var(--track-green)',
                    orange: 'var(--track-orange)',
                    pink: 'var(--track-pink)',
                    teal: 'var(--track-teal)',
                    indigo: 'var(--track-indigo)',
                    red: 'var(--track-red)',
                    text: 'var(--text-on-track)',
                }
            }
        },
    },
    plugins: [],
}
