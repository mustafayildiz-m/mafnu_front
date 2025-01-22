import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';
import * as fs from "node:fs";
import * as path from "node:path";

dotenv.config();
export default defineConfig({
    plugins: [react()],
    base: "",
    build: {
        chunkSizeWarningLimit: 3000,
    },
    define: {
        'process.env': process.env,
    },
    server: {
        watch: {
            usePolling: true,  // Docker içinde dosya izlemeyi etkinleştirir
            interval: 100,  // Varsayılan interval, dosya izleme hızını artırabilir
        },
        // https: {
        //     key: fs.readFileSync(path.resolve('certs/82.222.167.234.key')),
        //     cert: fs.readFileSync(path.resolve('certs/82.222.167.234.crt')),
        // },
        host: true,
        strictPort: true,
        port: 5173,
    }
});
