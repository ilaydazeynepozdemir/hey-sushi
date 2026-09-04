/**
 * Sürüm artırıcı.
 *
 *   npm run surum            → yama (0.1.0 → 0.1.1)
 *   npm run surum -- minor   → 0.1.0 → 0.2.0
 *
 * package.json "version" ve android/version.properties birlikte güncellenir.
 * versionCode her çağrıda 1 artar — Play aynı versionCode'u ikinci kez kabul etmez.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const kok = resolve(import.meta.dirname, "..");
const tur = process.argv[2] ?? "patch";

const pkgYol = resolve(kok, "package.json");
const pkg = JSON.parse(readFileSync(pkgYol, "utf8"));
const [ana, orta, yama] = pkg.version.split(".").map((n) => parseInt(n, 10) || 0);

const yeni =
  tur === "major" ? `${ana + 1}.0.0` : tur === "minor" ? `${ana}.${orta + 1}.0` : `${ana}.${orta}.${yama + 1}`;

pkg.version = yeni;
writeFileSync(pkgYol, JSON.stringify(pkg, null, 2) + "\n");

const propYol = resolve(kok, "android", "version.properties");
const ham = readFileSync(propYol, "utf8");
const kodEski = parseInt(/versionCode=(\d+)/.exec(ham)?.[1] ?? "1", 10);
const kod = kodEski + 1;
writeFileSync(
  propYol,
  `# Her mağaza yüklemesinde versionCode ARTMALI. \`npm run surum\` bunu yapar.\nversionCode=${kod}\nversionName=${yeni}\n`,
);

console.log(`✔ sürüm ${pkg.version}  ·  versionCode ${kod}`);
console.log(`  Sonraki: npm run build && npx cap sync`);
