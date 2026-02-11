/**
 * Script to add prerender = false to all authenticated pages
 * Run: node add-prerender-to-pages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, 'src', 'pages');

// Pages that should be server-rendered (authenticated)
const authenticatedPages = [
  'dashboard.astro',
  'categories/index.astro',
  'categories/new.astro',
  'categories/[id].astro',
  'contacts/index.astro',
  'media/index.astro',
  'posts/index.astro',
  'posts/new.astro',
  'posts/[id].astro',
  'products/index.astro',
  'products/new.astro',
  'products/[id].astro',
  'reservations/index.astro',
  'settings/index.astro',
  'users/index.astro',
  'users/new.astro',
  'users/[id].astro',
];

function addPrerenderDirective(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has prerender directive
  if (content.includes('export const prerender')) {
    console.log(`✓ Already has prerender: ${filePath}`);
    return;
  }
  
  // Find the frontmatter section
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    console.log(`✗ No frontmatter found: ${filePath}`);
    return;
  }
  
  const frontmatter = frontmatterMatch[1];
  const newFrontmatter = `---\n${frontmatter}\n\n// Disable prerendering for authenticated pages\nexport const prerender = false;\n---`;
  
  const newContent = content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`✓ Added prerender: ${filePath}`);
}

// Process all authenticated pages
authenticatedPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  
  if (fs.existsSync(filePath)) {
    addPrerenderDirective(filePath);
  } else {
    console.log(`✗ File not found: ${filePath}`);
  }
});

console.log('\n✅ Done!');
