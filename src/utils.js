export const countWords = (content) => (content.match(/[^\s]+/g) || []).length;
