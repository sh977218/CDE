/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./modules/**/*.{html,ts}"
    ],
    theme: {
        extend: {
            screens: {
                md: "768px",
                lg: "992px",
                xl:"1080px"
            },
        },
    },
    plugins: [],
    important: true
}

