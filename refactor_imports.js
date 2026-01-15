
import fs from 'fs';
import path from 'path';

const directory = 'src/features/theme-designer';

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
            callback(filepath);
        }
    });
}

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    // 1. Handle imports from @/components (exclude ui)
    // Regex: from "@/components/(?!ui)
    content = content.replace(/from\s+["']@\/components\/(?!ui)(.*?)["']/g, 'from "@/features/theme-designer/components/$1"');

    // 2. Handle imports from @/hooks
    content = content.replace(/from\s+["']@\/hooks\/(.*?)["']/g, 'from "@/features/theme-designer/hooks/$1"');

    // 3. Handle imports from @/lib (exclude utils)
    content = content.replace(/from\s+["']@\/lib\/(?!utils)(.*?)["']/g, 'from "@/features/theme-designer/utils/$1"');

    // 4. Dynamic imports
    content = content.replace(/import\(["']@\/components\/(?!ui)(.*?)["']\)/g, 'import("@/features/theme-designer/components/$1")');
    content = content.replace(/import\(["']@\/hooks\/(.*?)["']\)/g, 'import("@/features/theme-designer/hooks/$1")');

    // Fix: @/lib/utils is fine, but if file uses @/lib/utils.ts (explicit ext) or similar? 
    // Usually it is @/lib/utils

    if (content !== original) {
        console.log(`Updating ${filepath}`);
        fs.writeFileSync(filepath, content, 'utf8');
    }
}

walk(directory, processFile);
console.log('Done refactoring imports.');
