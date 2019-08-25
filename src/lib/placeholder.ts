import escape from "escape-string-regexp";

/**
 * A lightweight alternative to Handlebars.
 * Replace handlebars ()`{{...}}`) in a template based on key-value pairs.
 */
export function inject(template: string, values: { [index: string]: string }) {
  let compiledString = template;

  // Replace each key/value pair handle
  for (const [key, value] of Object.entries(values)) {
    const escapedKey = escape(key);
    compiledString = compiledString.replace(new RegExp(`{{${escapedKey}}}`, "g"), value);
  }

  // Remove any leftover handles
  return compiledString.replace(/{{[^{}]*}}/g, "");
}
