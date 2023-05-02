import { ItemView, parseFrontMatterEntry, MarkdownRenderer } from 'obsidian'; // eslint-disable-line
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import Goal from '../components/goal';
import Previewer from '../components/previewer';
import { countWords, removeFrontmatter } from '../utils';
import { ICON_NAME, DEFAULT_GOAL, VIEW_TYPE_GOAL } from '../constants';

export default class GoalView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_GOAL;
    }

    getDisplayText() {
        return 'Book goal';
    }

    getIcon() {
        return ICON_NAME;
    }

    async refresh() {
        this.plugin.saveSettings();
        const { todaysWordCount } = this.plugin.settings;
        const openFile = this.app.workspace.getActiveFile();
        const fileName = openFile?.basename;
        const books = this.plugin.getBooks();
        const currentBook = books.find(({ chapters, basename }) => chapters.includes(fileName) || basename === fileName);
        const chapters = currentBook?.chapters;

        if (!currentBook) {
            return this.root.render(<div className="pane-empty">No books found.</div>);
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

        const { frontmatter } = this.app.metadataCache.getFileCache(currentBook);
        const goal = parseFrontMatterEntry(frontmatter, 'goal') || DEFAULT_GOAL;

        const activeFile = await this.app.workspace.getActiveFile();
        const markdown = activeFile ? await this.app.vault.cachedRead(activeFile) : false;
        const markdownWithoutFrontmatter = removeFrontmatter(markdown);
        const content = await MarkdownRenderer.renderMarkdown(markdownWithoutFrontmatter);

        return this.root.render(
            <>
                <Goal goal={goal} totalWords={totalWords} todayWords={todayWords} />

                {this.plugin.settings.bookPreviewer && (
                    <div style={{ marginTop: '2rem' }}>
                        <p style={{ marginBottom: 0 }}><b>Book previewer</b></p>
                        <p style={{ marginTop: 0, fontSize: 12 }}>Preview your book as you write.</p>
                        <Previewer>{content}</Previewer>
                    </div>
                )}
            </>,
        );
    }

    async onOpen() {
        this.root = createRoot(this.containerEl.children[1]);
        await this.refresh();
        this.registerEvent(this.app.vault.on('modify', this.refresh.bind(this)));
        this.registerEvent(this.app.workspace.on('file-open', this.refresh.bind(this)));
    }
}
