export const removeFrontmatter = (markdown) => markdown?.replace(/^---[\s\S]+?---/, '');

export const countWords = (content) => (content.match(/[^\s]+/g) || []).length;
