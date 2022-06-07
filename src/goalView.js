import { ItemView, parseFrontMatterTags, parseFrontMatterEntry } from 'obsidian'; // eslint-disable-line
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Goal from './components/goal';
import { countWords } from './utils';

export const VIEW_TYPE_GOAL = 'book-goal';

export class GoalView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.todaysWordCount = plugin.settings.todaysWordCount;

        this.registerInterval(
            window.setInterval(() => {
                this.todaysWordCount = plugin.settings.todaysWordCount;
            }, 5000),
        );
    }

    getViewType() {
        return VIEW_TYPE_GOAL;
    }

    getDisplayText() {
        return 'Book Goal';
    }

    getIcon() {
        return 'book';
    }

    getBooks() {
        const files = this.app.vault.getMarkdownFiles().filter((file) => {
            const tags = parseFrontMatterTags(this.app.metadataCache.getFileCache(file)?.frontmatter) || [];
            return tags.includes('#type/ebook');
        }).map((file) => {
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
            const chapters = (parseFrontMatterEntry(frontmatter, 'chapters') || []).map(([c]) => c[0]) || [];
            return { ...file, chapters };
        });

        return files;
    }

    async init(that) {
        const openFile = (this || that).app.workspace.getActiveFile();
        const books = (this || that).getBooks();
        const currentBook = openFile && books.find((book) => book.chapters.includes(openFile.basename) || book.basename === openFile.basename);

        const chapters = currentBook?.chapters;

        if (!currentBook) {
            ReactDOM.render(
                <div className="pane-empty">No books found.</div>,
                (this || that).containerEl.children[1],
            );
            return;
        }

        let totalWords = 0;
        let todayWords = 0;

        for await (const chapter of chapters) {
            const file = `${chapter}.md`;
            const targetFile = (this || that).app.vault.getFiles().find((f) => f.path === file);
            const content = targetFile ? await (this || that).app.vault.cachedRead(targetFile) : '';
            const words = countWords(content);
            totalWords += words;
            todayWords += (this.todaysWordCount[file]?.current || 0) - (this.todaysWordCount[file]?.initial || 0);
        }

        ReactDOM.render(
            <Goal goal={20000} words={totalWords} todayWords={todayWords} />,
            (this || that).containerEl.children[1],
        );
    }

    async onOpen() {
        await this.init();
    }

    async load() {
        super.load();
        this.registerEvent(this.app.vault.on('modify', () => this.init(this)));
        this.registerEvent(this.app.workspace.on('file-open', () => this.init(this)));
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
    }
}
