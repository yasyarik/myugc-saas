
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper: Generate metadata from filename
function generateMetadataFromFilename(filename: string, type: 'model' | 'location', dirPath: string) {
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png)$/i, '');

    // Convert to kebab-case for ID (e.g., "Brick Wall" -> "brick-wall")
    const id = nameWithoutExt
        .toLowerCase()
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '');  // Remove special characters

    if (type === 'model') {
        // Detect gender from filename
        const gender = id.includes('female') ? 'female' :
            id.includes('male') ? 'male' : 'unisex';

        // Use original name (with proper capitalization)
        const name = nameWithoutExt;

        return {
            id,
            name,
            gender,
            image: `/${dirPath}/${filename}`,
            description: `${gender.charAt(0).toUpperCase() + gender.slice(1)} model`
        };
    } else {
        // Location/Placement - use original name
        const name = nameWithoutExt;

        return {
            id,
            name,
            image: `/${dirPath}/${filename}`,
            description: `${name} background`,
            prompt: `a professional commercial product photography background in a ${name.toLowerCase()} setting, empty, no products, no humans, 8k resolution`
        };
    }
}

// Scan directory and auto-generate presets
async function scanPresetsDirectory(dirName: string, type: 'model' | 'location') {
    try {
        const fullPath = path.join(process.cwd(), 'public', dirName);
        const files = await fs.readdir(fullPath);

        const autoPresets = [];
        for (const file of files) {
            // Only process image files
            if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;

            // Generate metadata
            const preset = generateMetadataFromFilename(file, type, dirName);
            autoPresets.push(preset);
        }

        return autoPresets;
    } catch (error) {
        console.error(`Failed to scan ${dirName}:`, error);
        return [];
    }
}

export async function GET() {
    // Scan directories
    const models = await scanPresetsDirectory('presets/models', 'model');
    const locations = await scanPresetsDirectory('presets/locations', 'location');
    const placements = await scanPresetsDirectory('presets/placements', 'location'); // Placements are technically location-type metadata

    return NextResponse.json({
        models,
        locations,
        placements
    });
}
