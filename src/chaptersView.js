import { ItemView, parseFrontMatterTags, parseFrontMatterEntry } from 'obsidian'; // eslint-disable-line

export const VIEW_TYPE_BOOK = 'book-chapters';

export class ChaptersView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_BOOK;
    }

    getDisplayText() {
        return 'Book Chapters';
    }

    getIcon() {
        return 'book';
    }

    init() {
        const openFile = this.app.workspace.getActiveFile();
        const books = this.plugin.getBooks();
        const fileName = openFile?.basename;
        const currentBook = books.find((book) => book.chapters.includes(fileName) || book.basename === fileName);
        const chapters = currentBook?.chapters;

        const root = createDiv({ cls: 'nav-folder mod-root' });
        const children = root.createDiv({ cls: 'nav-folder-children' });
        const container = this.containerEl.children[1];
        container.empty();

        if (!chapters) {
            container.createEl('div', { cls: 'pane-empty', text: 'No books found.' });
            return;
        }

        for (const chapter of chapters) {
            const navFile = children.createDiv({ cls: 'nav-file' });
            const navFileTitle = navFile.createDiv({ cls: 'nav-file-title', attr: { style: 'padding-left: 0px;' } });

            navFileTitle.createDiv({
                text: chapter,
                cls: 'nav-file-title-content',
                attr: { style: 'border-left: none; padding-left: 0px;' },
            });

            navFile.addEventListener('click', async () => {
                const targetFile = this.app.vault.getMarkdownFiles().find((f) => f.path === `${chapter}.md`)
                 || await this.app.vault.create(`${chapter}.md`, '');
                const leaf = this.app.workspace.getMostRecentLeaf();
                leaf.openFile(targetFile);
            });
        }

        container.createEl('p', { text: currentBook.basename, attr: { style: 'margin-top: 0px;' } });
        container.appendChild(root);
    }

    onOpen() {
        this.init();
        this.registerEvent(this.app.workspace.on('file-open', this.init.bind(this)));
    }
}
