import { Plugin, addIcon, parseFrontMatterTags, parseFrontMatterEntry } from 'obsidian'; // eslint-disable-line

import { VIEW_TYPE_BOOK, ChaptersView } from './views/chapters';
import { VIEW_TYPE_GOAL, GoalView } from './views/goal';
import { ICON_NAME, ICON_SVG } from './constants';
import { countWords } from './utils';

export default class BookPlugin extends Plugin {
    async onload() {
        this.settings = await this.loadData();

        addIcon(ICON_NAME, ICON_SVG);

        this.registerView(VIEW_TYPE_BOOK, (leaf) => new ChaptersView(leaf, this));
        this.registerView(VIEW_TYPE_GOAL, (leaf) => new GoalView(leaf, this));

        if (this.app.workspace.layoutReady) {
            this.initLeaf();
        } else {
            this.registerEvent(this.app.workspace.on('layout-ready', this.initLeaf.bind(this)));
        }
    }

    initLeaf() {
        if (!this.app.workspace.getLeavesOfType(VIEW_TYPE_BOOK).length) {
            this.app.workspace.getLeftLeaf(false).setViewState({
                type: VIEW_TYPE_BOOK,
                active: true,
            });
        }

        if (!this.app.workspace.getLeavesOfType(VIEW_TYPE_GOAL).length) {
            this.app.workspace.getRightLeaf(false).setViewState({
                type: VIEW_TYPE_GOAL,
                active: true,
            });
        }
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_BOOK);
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);
    }

    getBooks() {
        const files = this.app.vault.getMarkdownFiles();

        const books = files.filter((file) => {
            const tags = parseFrontMatterTags(this.app.metadataCache.getFileCache(file)?.frontmatter) || [];
            return tags.includes('#type/book');
        });

        const booksWithChapters = books.map((file) => {
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
            const chapters = (parseFrontMatterEntry(frontmatter, 'chapters') || []).flat(2);
            return { ...file, chapters };
        });

        return booksWithChapters;
    }

    async saveSettings() {
        const books = this.getBooks();
        const chapters = books.map((book) => book.chapters).flat();
        const today = `${(new Date()).getFullYear()}/${(new Date()).getMonth()}/${(new Date()).getDate()}`;
        const isNewDay = this.settings.today !== today;

        for await (const chapter of chapters) {
            const file = `${chapter}.md`;
            const targetFile = this.app.vault.getMarkdownFiles().find((f) => f.path === file);
            const content = targetFile ? await this.app.vault.cachedRead(targetFile) : '';
            const words = countWords(content);
            const initial = this.settings.todaysWordCount[targetFile?.name]?.initial || words;

            this.settings = {
                ...this.settings,
                todaysWordCount: {
                    ...this.settings.todaysWordCount,
                    [`${targetFile?.name}`]: {
                        initial: isNewDay ? words : initial,
                        current: words,
                    },
                },
            };
        }

        this.settings = { ...this.settings, today };
        this.saveData(this.settings);
    }
}
