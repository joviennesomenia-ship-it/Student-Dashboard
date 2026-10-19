const c = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { primary: c('primary'), accent: c('accent'), bg: c('bg'), card: c('card'), ink: c('text'), muted: c('muted'), onp: c('onp') },
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Poppins', 'Inter', 'sans-serif'] } } },
}
