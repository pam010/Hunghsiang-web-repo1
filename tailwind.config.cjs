module.exports = {
  content: [
    './*.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'sans-serif'],
        tech: ['Rajdhani', '"Noto Sans TC"', 'sans-serif']
      },
      colors: {
        industrial: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          accent: '#0284c7',
          action: '#0369a1',
          'action-hover': '#075985',
          light: '#f8fafc'
        }
      }
    }
  },
  plugins: []
};
