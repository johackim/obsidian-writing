import { PluginSettingTab, Setting } from 'obsidian'; // eslint-disable-line

export default class SettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for the Writing plugin' });

        new Setting(containerEl)
            .setName('Book previewer')
            .setDesc('Display book previewer')
            .addToggle((text) => text
                .setValue(this.plugin.settings.bookPreviewer)
                .onChange(async (value) => {
                    this.plugin.settings.bookPreviewer = value;
                    await this.plugin.saveSettings();
                }));
    }
}
