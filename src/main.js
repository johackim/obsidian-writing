import { Plugin, addIcon, MarkdownView } from 'obsidian'; // eslint-disable-line

import { VIEW_TYPE_BOOK, ChaptersView } from './chaptersView';
import { VIEW_TYPE_GOAL, GoalView } from './goalView';
import { ICON_NAME, ICON_SVG } from './constants';
import { countWords } from './utils';

export default class BookPlugin extends Plugin {
    async onload() {
        this.settings = await this.loadData();

        addIcon(ICON_NAME, ICON_SVG);

        this.registerView(VIEW_TYPE_BOOK, (leaf) => new ChaptersView(leaf));
        this.registerView(VIEW_TYPE_GOAL, (leaf) => new GoalView(leaf, this));

        this.registerEvent(
            this.app.workspace.on('quick-preview', this.onQuickPreview.bind(this)),
        );

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

    onQuickPreview(openFile, content) {
        if (this.app.workspace.getActiveViewOfType(MarkdownView)) {
            this.saveSettings(openFile, content);
        }
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_BOOK);
    }

    async saveSettings(openFile, content) {
        if (!openFile) return;

        const words = countWords(content);
        const today = `${(new Date()).getFullYear()}/${(new Date()).getMonth()}/${(new Date()).getDate()}`;
        const isNewDay = this.settings.today !== today;
        const initial = this.settings.todaysWordCount[openFile.name]?.initial || words;

        this.saveData({
            ...this.settings || { todaysWordCount: {} },
            today,
            todaysWordCount: {
                ...this.settings.todaysWordCount,
                [`${openFile.name}`]: {
                    initial: isNewDay ? words : initial,
                    current: words,
                },
            },
        });

        this.settings = await this.loadData();
    }
}
