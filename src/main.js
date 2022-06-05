import { Plugin, addIcon } from 'obsidian'; // eslint-disable-line

import { VIEW_TYPE_BOOK, BookView } from './view';
import { ICON_NAME, ICON_SVG } from './constants';

export default class BookPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_BOOK, (leaf) => new BookView(leaf));

        addIcon(ICON_NAME, ICON_SVG);

        await this.app.workspace.getLeftLeaf(false).setViewState({
            type: VIEW_TYPE_BOOK,
            active: true,
        });
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_BOOK);
    }
}
