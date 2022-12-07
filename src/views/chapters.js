import { ItemView } from 'obsidian'; // eslint-disable-line

import { ICON_NAME, VIEW_TYPE_CHAPTERS } from '../constants';

export default class ChaptersView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_CHAPTERS;
    }

    getDisplayText() {
        return 'Book chapters';
    }

    getIcon() {
        return ICON_NAME;
    }

    async refresh() {
        const activeFile = this.app.workspace.getActiveFile();
        const books = this.plugin.getBooks();
        const fileName = activeFile?.basename;
        const currentBook = books.find((book) => book.chapters.includes(fileName) || book.basename === fileName);
        const chapters = currentBook?.chapters;

        const container = this.containerEl.children[1];
        container.empty();

        if (!chapters) {
            container.createEl('div', { cls: 'pane-empty', text: 'No books found.' });
            return;
        }

        container.createEl('p', { text: `Chapters of "${currentBook.basename}"`, attr: { style: 'margin-top: 0px;' } });
        container.createEl('div', { cls: 'nav-folder mod-root' });
        container.createEl('div', { cls: 'nav-folder-children' });

        for (const chapter of chapters) {
            const navFile = container.createEl('div', { cls: 'nav-file' });
            const navFileTitle = navFile.createEl('div', { cls: 'nav-file-title', attr: { style: 'padding-left: 0px;' } });

            navFileTitle.createEl('div', {
                text: chapter,
                cls: 'nav-file-title-content',
                attr: { style: 'border-left: none; padding-left: 0px;' },
            });

            navFile.addEventListener('click', async () => {
                const targetFile = this.app.vault.getAbstractFileByPath(`${chapter}.md`)
                 || await this.app.vault.create(`${chapter}.md`, '');
                const leaf = this.app.workspace.getLeaf();
                leaf.openFile(targetFile);
            });
        }
    }

    async onOpen() {
        await this.refresh();
        this.registerEvent(this.app.vault.on('modify', this.refresh.bind(this)));
        this.registerEvent(this.app.workspace.on('file-open', this.refresh.bind(this)));
    }
}
