import { Plugin, addIcon, parseFrontMatterTags, parseFrontMatterEntry } from 'obsidian'; // eslint-disable-line

import ChaptersView from './views/chapters';
import GoalView from './views/goal';
import { DEFAULT_SETTINGS, ICON_NAME, ICON_SVG, VIEW_TYPE_GOAL, VIEW_TYPE_CHAPTERS } from './constants';
import { countWords } from './utils';

export default class BookPlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        addIcon(ICON_NAME, ICON_SVG);

        this.registerView(VIEW_TYPE_CHAPTERS, (leaf) => new ChaptersView(leaf, this));
        this.registerView(VIEW_TYPE_GOAL, (leaf) => new GoalView(leaf, this));

        this.app.workspace.onLayoutReady(() => {
            this.initLeaf();
        });
    }

    initLeaf() {
        if (!this.app.workspace.getLeavesOfType(VIEW_TYPE_CHAPTERS).length) {
            this.app.workspace.getLeftLeaf(false).setViewState({
                type: VIEW_TYPE_CHAPTERS,
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
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAPTERS);
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOAL);
    }

    getBooks() {
        const files = this.app.vault.getMarkdownFiles();

        const books = files.filter((file) => {
            const { frontmatter } = this.app.metadataCache.getFileCache(file);
            const tags = parseFrontMatterTags(frontmatter) || [];
            return tags.includes('#book');
        });

        return books.map((file) => {
            const { frontmatter } = this.app.metadataCache.getFileCache(file);
            const chapters = (parseFrontMatterEntry(frontmatter, 'chapters') || []).flat(2);
            return { ...file, chapters };
        });
    }

    async loadSettings() {
        this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
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
                    [file]: {
                        initial: isNewDay ? words : initial,
                        current: words,
                    },
                },
            };
        }

        this.settings = { ...DEFAULT_SETTINGS, ...this.settings, today };
        this.saveData(this.settings);
    }
}
