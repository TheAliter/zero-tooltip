import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path";
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },

    plugins: [vue(), dts({ rollupTypes: true })],
    
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'ZeroTooltip',
            fileName: 'zero-tooltip'
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue",
                },
            },
        },
    },
})
