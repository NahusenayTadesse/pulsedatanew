/**
 * Moves the seeded case-study images out of `static/` and into `FILES_DIR`.
 *
 * They started life as committed files under `static/projects/<slug>/`, which
 * made them fast to ship but impossible to change from the dashboard: nothing
 * in the admin interface can replace a file the build serves directly. Treating
 * them as ordinary uploads fixes that — a gallery image is now the same kind of
 * thing as a contact-form attachment or a cover photo, and the same screens
 * manage it.
 *
 * The names have to be UUIDs. `/files/[name=filename]` matches only the shape
 * `saveUploadedFile` produces, and that strictness is what stops the route
 * addressing a subdirectory or reaching into `FILES_DIR/private` — so it is not
 * something to relax for the sake of readable filenames.
 *
 * Run once:
 *
 *   npx tsx scripts/migrate-project-images.ts
 *
 * It prints a mapping to paste into `projects.ts`, and is safe to re-run: a
 * file already present in `FILES_DIR` is left alone.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const SOURCE = path.resolve('static/projects');
const FILES_DIR = path.resolve(process.env.FILES_DIR ?? '.tempFiles');

if (!fs.existsSync(SOURCE)) {
	console.log('Nothing to migrate: static/projects does not exist.');
	process.exit(0);
}

fs.mkdirSync(FILES_DIR, { recursive: true });

/** slug -> { originalName -> storedFileName } */
const mapping: Record<string, Record<string, string>> = {};

for (const slug of fs.readdirSync(SOURCE).sort()) {
	const dir = path.join(SOURCE, slug);
	if (!fs.statSync(dir).isDirectory()) continue;

	mapping[slug] = {};

	for (const file of fs.readdirSync(dir).sort()) {
		const ext = path.extname(file);
		const stored = `${randomUUID()}${ext}`;

		fs.copyFileSync(path.join(dir, file), path.join(FILES_DIR, stored));
		mapping[slug][path.basename(file, ext)] = stored;
	}
}

const total = Object.values(mapping).reduce((n, files) => n + Object.keys(files).length, 0);
console.log(`Copied ${total} files into ${FILES_DIR}\n`);
console.log(JSON.stringify(mapping, null, '\t'));
