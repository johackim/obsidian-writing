import { ItemView, parseFrontMatterTags, parseFrontMatterEntry } from 'obsidian'; // eslint-disable-line

export const VIEW_TYPE_BOOK = 'book-chapters';

export class ChaptersView extends ItemView {
    getViewType() {
        return VIEW_TYPE_BOOK;
    }

    getDisplayText() {
        return 'Book Chapters';
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

    init(that) {
        const openFile = (this || that).app.workspace.getActiveFile();
        const books = (this || that).getBooks();
        const currentBook = openFile && books.find((book) => book.chapters.includes(openFile.basename) || book.basename === openFile.basename);
        const chapters = currentBook?.chapters;

        const root = createDiv({ cls: 'nav-folder mod-root' });
        const children = root.createDiv({ cls: 'nav-folder-children' });
        const container = (this || that).containerEl.children[1];
        container.empty();

        if (!chapters) {
            container.createEl('div', { cls: 'pane-empty', text: 'No chapters found.' });
            return;
        }

        chapters.forEach((chapter) => {
            const navFile = children.createDiv({ cls: 'nav-file' });
            const navFileTitle = navFile.createDiv({ cls: 'nav-file-title', attr: { style: 'padding-left: 0px;' } });

            navFileTitle.createDiv({
                text: chapter,
                cls: 'nav-file-title-content',
                attr: { style: 'border-left: none; padding-left: 0px;' },
            });

            navFile.addEventListener('click', async () => {
                const targetFile = (this || that).app.vault.getFiles().find((f) => f.path === `${chapter}.md`)
                 || await (this || that).app.vault.create(`${chapter}.md`, '');
                const leaf = (this || that).app.workspace.getMostRecentLeaf();
                leaf.openFile(targetFile);
            });
        });

        container.createEl('p', { text: currentBook.basename, attr: { style: 'margin-top: 0px;' } });
        container.appendChild(root);
    }

    load() {
        super.load();
        this.registerEvent(this.app.workspace.on('file-open', () => this.init(this)));
    }

    onOpen() {
        this.init();
    }
}
