async function insertText(type) {
  const options = await browser.storage.local.get('options');
  const trimmedType = type.trim();
  let optionText = '';

  if (options && options.options) {
    optionText = options.options[trimmedType];
  }

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { type, text: optionText }).catch((error) => {
      console.info('Error sending message to content script:', error);
    });
  });
}

async function createMenus() {
  const { options } = await browser.storage.local.get('options');

  browser.contextMenus.create({
    id: 'lorem-title',
    title: 'Title',
    contexts: ['editable'],
    onclick: () => insertText('title')
  });

  browser.contextMenus.create({
    id: 'lorem-short',
    title: 'Short',
    contexts: ['editable'],
    onclick: () => insertText('short')
  });

  browser.contextMenus.create({
    id: 'lorem-section',
    title: 'Section',
    contexts: ['editable'],
    onclick: () => insertText('section')
  });

  browser.contextMenus.create({
    id: 'lorem-long',
    title: 'Multi-paragraph',
    contexts: ['editable'],
    onclick: () => insertText('long')
  });

  browser.contextMenus.create({
    id: 'generate-email',
    title: 'E-mail address',
    contexts: ['editable'],
    onclick: () => insertText('email')
  });

  if (options) {
    const optionKeys = Object.keys(options);

    if (optionKeys.length > 0) {
      browser.contextMenus.create({
        id: 'divider-2',
        type: 'separator',
        contexts: ['editable']
      });

      for (const key of optionKeys) {
        const option = {
          id: "custom" + key,
          title: key,
          contexts: ['editable'],
          onclick: () => insertText(key),
        };
        browser.contextMenus.create(option);
      }
    }
  }

  browser.contextMenus.create({
    id: 'divider',
    type: 'separator',
    contexts: ['editable']
  });

  browser.contextMenus.create({
    id: 'preferences',
    title: 'Preferences',
    contexts: ['editable'],
    onclick: () => {
      browser.tabs.create({
        url: browser.runtime.getURL('preferences.html#preferences'),
        active: true
      });
    }
  });

  browser.contextMenus.create({
    id: 'about',
    title: 'About',
    contexts: ['editable'],
    onclick: () => {
      browser.tabs.create({
        url: browser.runtime.getURL('preferences.html#about'),
        active: true
      });
    }
  });
}

browser.storage.onChanged.addListener((changes) => {
  if (changes.options) {
    browser.contextMenus.removeAll().then(() => {
      createMenus();
    });
  }
});

createMenus();
