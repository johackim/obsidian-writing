import { Plugin, addIcon } from 'obsidian'; // eslint-disable-line

import { VIEW_TYPE_BOOK, ChaptersView } from './chaptersView';
import { VIEW_TYPE_GOAL, GoalView } from './goalView';
import { ICON_NAME, ICON_SVG } from './constants';
import { countWords } from './utils';

export default class BookPlugin extends Plugin {
    async onload() {
        const settings = await this.loadData();

        await addIcon(ICON_NAME, ICON_SVG);

        await this.registerView(VIEW_TYPE_BOOK, (leaf) => new ChaptersView(leaf));
        await this.registerView(VIEW_TYPE_GOAL, (leaf) => new GoalView(leaf, settings.todaysWordCount));

        await this.app.workspace.getLeftLeaf(false).setViewState({
            type: VIEW_TYPE_BOOK,
            active: true,
        });

        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE_GOAL,
            active: true,
        });

        await this.registerEvent(this.app.vault.on('modify', () => this.saveSettings()));

        await this.registerEvent(this.app.workspace.on('file-open', () => this.saveSettings()));
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_BOOK);
    }

    async saveSettings() {
        const openFile = this.app.workspace.getActiveFile();
        const content = openFile ? await this.app.vault.cachedRead(openFile) : '';
        const words = countWords(content);
        const settings = await this.loadData();

        await this.saveData({
            ...settings,
            todaysWordCount: {
                ...settings.todaysWordCount,
                [`${openFile.name}`]: {
                    initial: 1,
                    current: words,
                },
            },
        });
    }
}
