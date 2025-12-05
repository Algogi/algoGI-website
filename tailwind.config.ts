import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			dark: {
  				bg: '#0a0a0a',
  				surface: '#111111',
  				card: '#1a1a1a',
  				border: '#2a2a2a'
  			},
  			light: {
  				bg: '#ffffff',
  				surface: '#f9fafb',
  				card: '#ffffff',
  				border: '#e5e7eb'
  			},
  			neon: {
  				blue: '#00f0ff',
  				cyan: '#00ffff',
  				purple: '#b026ff',
  				pink: '#ff00ff',
  				violet: '#8b5cf6'
  			},
  			'neon-light': {
  				blue: '#0088cc',
  				cyan: '#0088cc',
  				purple: '#8b1aff',
  				pink: '#cc00cc',
  				violet: '#6d28d9'
  			},
  			brand: {
  				DEFAULT: '#4A3AFF',
  				primary: '#4A3AFF',
  				'primary-dark': '#3a2ae6',
  				'primary-light': '#5a4aff',
  				blue: '#1e40af',
  				'blue-dark': '#1e3a8a',
  				'blue-light': '#3b82f6'
  			},
  			primary: {
  				'50': '#edeaff',
  				'100': '#d1c7ff',
  				'200': '#b3a4ff',
  				'300': '#9581ff',
  				'400': '#775eff',
  				'500': '#4A3AFF',
  				'600': '#3a2ae6',
  				'700': '#2a1acc',
  				'800': '#1a0ab3',
  				'900': '#0a0099',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#f5e6ff',
  				'100': '#e6b3ff',
  				'200': '#d780ff',
  				'300': '#c84dff',
  				'400': '#b91aff',
  				'500': '#b026ff',
  				'600': '#8f1fcc',
  				'700': '#6e1899',
  				'800': '#4d1166',
  				'900': '#2c0a33',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geometric)',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'glitch': 'glitch 0.3s infinite',
  			'glow': 'glow 2s ease-in-out infinite alternate',
  			'float': 'float 6s ease-in-out infinite',
  			'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'shimmer': 'shimmer 2s linear infinite'
  		},
  		keyframes: {
  			glitch: {
  				'0%, 100%': {
  					transform: 'translate(0)'
  				},
  				'20%': {
  					transform: 'translate(-2px, 2px)'
  				},
  				'40%': {
  					transform: 'translate(-2px, -2px)'
  				},
  				'60%': {
  					transform: 'translate(2px, 2px)'
  				},
  				'80%': {
  					transform: 'translate(2px, -2px)'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 5px #4A3AFF, 0 0 10px #4A3AFF, 0 0 15px #4A3AFF'
  				},
  				'100%': {
  					boxShadow: '0 0 10px #4A3AFF, 0 0 20px #4A3AFF, 0 0 30px #4A3AFF, 0 0 40px #b026ff'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'pulse-neon': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'neon-gradient': 'linear-gradient(135deg, #4A3AFF 0%, #b026ff 100%)',
  			'neon-gradient-light': 'linear-gradient(135deg, #4A3AFF 0%, #8b1aff 100%)',
  			'brand-gradient': 'linear-gradient(135deg, #4A3AFF 0%, #5a4aff 100%)',
  			'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
  			'light-gradient': 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
export default config;

