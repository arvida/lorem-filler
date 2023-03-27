const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function generateLoremIpsum(minWords, maxWords) {
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const generatedWords = words.slice(0, 5);

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  let sentenceWordCount = 0;
  let sentenceCount = 1;
  let newParagraphAt = Math.floor(Math.random() * 4) + 5;

  for (let i = 5; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    let nextWord = words[randomIndex];
    sentenceWordCount++;

    if (sentenceWordCount >= 4 && Math.random() < 0.4) {
      nextWord += '.';
      sentenceCount++;

      if (sentenceCount === newParagraphAt) {
        nextWord += '\n\n';
        sentenceCount = 0;
        newParagraphAt = Math.floor(Math.random() * 4) + 5;
      }

      if (i < wordCount - 1) {
        generatedWords.push(nextWord);
        i++;
        const newIndex = Math.floor(Math.random() * words.length);
        nextWord = capitalizeFirstLetter(words[newIndex]);
        sentenceWordCount = 0;
      }
    }

    if (sentenceWordCount >= 15) {
      nextWord += '.';
      sentenceCount++;

      if (sentenceCount === newParagraphAt) {
        nextWord += '\n\n';
        sentenceCount = 0;
        newParagraphAt = Math.floor(Math.random() * 4) + 5;
      }

      if (i < wordCount - 1) {
        generatedWords.push(nextWord);
        i++;
        const newIndex = Math.floor(Math.random() * words.length);
        nextWord = capitalizeFirstLetter(words[newIndex]);
        sentenceWordCount = 0;
      }
    }

    generatedWords.push(nextWord);
  }

  if (!generatedWords[generatedWords.length - 1].endsWith('.')) {
    generatedWords[generatedWords.length - 1] += '.';
  }

  return capitalizeFirstLetter(
    generatedWords.join(' ').
      replaceAll(',.', '.').
      replaceAll(' ,', ',').
      replaceAll('  ', ' ').
      replaceAll(' .', '.').
      replaceAll('\n ', '\n')
    );
}

function generateLoremIpsumEmail() {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
  const randomIndex1 = Math.floor(Math.random() * words.length);
  const randomIndex2 = Math.floor(Math.random() * words.length);
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${words[randomIndex1]}.${words[randomIndex2]}${randomNumber}@example.com`;
}

browser.runtime.onMessage.addListener((request) => {
  const { type, text } = request;
  const { element, elementWindow } = getActiveElement();

  if (element) {
    let newText;

    if (type === 'email') {
      newText = generateLoremIpsumEmail();
    } else if (text) {
      newText = text;
    } else {
      let minLength, maxLength;

      if (type === 'short') {
        minLength = 5;
        maxLength = 11;
      } else if (type === 'title') {
        minLength = 4;
        maxLength = 7;
      } else if (type === 'section') {
        minLength = 35;
        maxLength = 60;
      } else {
        minLength = 160;
        maxLength = 220;
      }

      newText = generateLoremIpsum(minLength, maxLength);

      if (type === 'section' || type === 'short' || type === 'title') {
        newText = newText.replaceAll('\n', ' ').replaceAll('  ', ' ');
      }

      if (type === 'title') {
        newText = newText.replaceAll('.', '');
      }
    }

    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      const start = element.selectionStart;
      const end = element.selectionEnd;
      element.setRangeText(newText, start, end, 'select');
    } else if (element.isContentEditable) {
      if (window.location.hostname.includes('notion.so')) {
        insertTextIntoNotion(element, newText);
      } else {
        insertTextIntoContentEditable(element, newText, elementWindow);
      }
    }
  }
});

function getActiveElement() {
  let element = document.activeElement;
  let elementWindow = window;

  while (element && element.tagName === 'IFRAME') {
    elementWindow = element.contentWindow;
    element = element.contentDocument.activeElement;
  }

  return { element, elementWindow };
}


function insertTextIntoNotion(contentEditable, text) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(contentEditable, 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand('insertHTML', false, text);
}

function insertTextIntoContentEditable(element, text, elementWindow) {
  element.focus();
  const selection = elementWindow.getSelection();
  const range = selection.getRangeAt(0);
  range.deleteContents();

  const lines = text.split('\n');
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const textNode = element.ownerDocument.createTextNode(line);
    fragment.appendChild(textNode);
    if (i < lines.length - 1) {
      fragment.appendChild(document.createElement('br'));
    }
  }
  range.insertNode(fragment);
  range.setStartAfter(fragment);
  range.setEndAfter(fragment);
  selection.removeAllRanges();
  selection.addRange(range);
}
