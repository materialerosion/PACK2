import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/data': path.resolve(__dirname, './src/data'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Generate source maps for debugging production issues
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: React core
          'vendor-react': ['react', 'react-dom'],
          // Vendor: 3D rendering (largest dependency)
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          // Vendor: Export libraries
          'vendor-export': ['jspdf', 'jspdf-autotable', 'html2canvas', 'xlsx'],
          // Vendor: UI libraries
          'vendor-ui': [
            'framer-motion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          // Vendor: DnD
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // Vendor: State & utilities
          'vendor-state': ['zustand', 'immer', 'dexie', 'uuid'],
        },
      },
    },
  },
})
