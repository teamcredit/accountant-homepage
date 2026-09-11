import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");
const today = new Date();
today.setHours(23, 59, 59, 999);

const errors = [];
const warnings = [];

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return Number.isFinite(new Date(`${value}T00:00:00+09:00`).getTime());
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

for (const fileName of fs.readdirSync(postsDirectory).filter((name) => name.endsWith(".mdx"))) {
  const fullPath = path.join(postsDirectory, fileName);
  const { data } = matter(fs.readFileSync(fullPath, "utf8"));

  if (data.published === false) {
    continue;
  }

  for (const key of ["title", "description", "date", "category"]) {
    if (typeof data[key] !== "string" || data[key].trim().length === 0) {
      errors.push(`${fileName}: missing required frontmatter "${key}"`);
    }
  }

  if (!isValidDate(data.date)) {
    errors.push(`${fileName}: invalid date "${data.date ?? ""}"`);
  } else if (new Date(`${data.date}T00:00:00+09:00`) > today) {
    errors.push(`${fileName}: date is in the future (${data.date})`);
  }

  if (data.updatedAt && !isValidDate(data.updatedAt)) {
    errors.push(`${fileName}: invalid updatedAt "${data.updatedAt}"`);
  }

  if (data.lastChecked && !isValidDate(data.lastChecked)) {
    errors.push(`${fileName}: invalid lastChecked "${data.lastChecked}"`);
  }

  if (data.lastChecked && isValidDate(data.lastChecked) && today - new Date(`${data.lastChecked}T00:00:00+09:00`) > 120 * 86400000) {
    warnings.push(`${fileName}: editorial review is older than 120 days (${data.lastChecked})`);
  }

  if (!data.lastChecked) {
    warnings.push(`${fileName}: missing lastChecked`);
  }

  if (!Array.isArray(data.sourceLinks) || data.sourceLinks.length === 0) {
    warnings.push(`${fileName}: missing sourceLinks`);
  } else {
    for (const [index, source] of data.sourceLinks.entries()) {
      if (!source || typeof source !== "object") {
        errors.push(`${fileName}: sourceLinks[${index}] must be an object`);
        continue;
      }

      if (typeof source.label !== "string" || source.label.trim().length === 0) {
        errors.push(`${fileName}: sourceLinks[${index}] missing label`);
      }

      if (typeof source.url !== "string" || !isHttpUrl(source.url)) {
        errors.push(`${fileName}: sourceLinks[${index}] invalid URL`);
      }
    }
  }
}

for (const warning of warnings.slice(0, 30)) {
  console.warn(`warning: ${warning}`);
}

if (warnings.length > 30) {
  console.warn(`warning: ${warnings.length - 30} additional content warning(s) omitted`);
}

for (const error of errors) {
  console.error(`error: ${error}`);
}

console.log(
  `Content audit completed: ${errors.length} error(s), ${warnings.length} warning(s).`
);

if (errors.length > 0) {
  process.exit(1);
}
