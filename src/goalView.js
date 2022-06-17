import { ItemView, parseFrontMatterEntry } from 'obsidian'; // eslint-disable-line
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Goal from './components/goal';
import { countWords } from './utils';

export const VIEW_TYPE_GOAL = 'book-goal';

export class GoalView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
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

    async init() {
        await this.plugin.saveSettings();
        const { todaysWordCount } = this.plugin.settings;
        const openFile = this.app.workspace.getActiveFile();
        const fileName = openFile?.basename;
        const books = this.plugin.getBooks();
        const currentBook = books.find(({ chapters, basename }) => chapters.includes(fileName) || basename === fileName);
        const chapters = currentBook?.chapters;

        if (!currentBook) {
            ReactDOM.render(
                <div className="pane-empty">No books found.</div>,
                this.containerEl.children[1],
            );
            return;
        }

        let totalWords = 0;
        let todayWords = 0;

        for await (const chapter of chapters) {
            const file = `${chapter}.md`;
            const targetFile = this.app.vault.getFiles().find((f) => f.path === file);
            const content = targetFile ? await this.app.vault.cachedRead(targetFile) : '';
            const words = countWords(content);
            totalWords += words;
            todayWords += (todaysWordCount[file]?.current || 0) - (todaysWordCount[file]?.initial || 0);
        }

        const frontmatter = this.app.metadataCache.getFileCache(currentBook)?.frontmatter;
        const goal = parseFrontMatterEntry(frontmatter, 'goal');

        ReactDOM.render(
            <Goal goal={goal || 20000} words={totalWords} todayWords={todayWords} />,
            this.containerEl.children[1],
        );
    }

    async onOpen() {
        this.init();
        this.registerEvent(this.app.vault.on('modify', this.init.bind(this)));
        this.registerEvent(this.app.workspace.on('file-open', this.init.bind(this)));
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
    }
}
