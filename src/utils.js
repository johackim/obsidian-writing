import showdown from 'showdown';

const removeFrontmatter = (markdown) => markdown?.replace(/^---[\s\S]+?---/, '');

export const markdownToHtml = (markdown) => {
    const converter = new showdown.Converter();
    const md = removeFrontmatter(markdown);
    converter.setOption('simpleLineBreaks', true);
    return converter.makeHtml(md);
};

export const countWords = (content) => (content.match(/[^\s]+/g) || []).length;
