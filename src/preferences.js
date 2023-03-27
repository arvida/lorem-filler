const optionList = document.getElementById('option-list');
const addOptionForm = document.getElementById('add-option-form');
const optionNameInput = document.getElementById('option-name');
const optionTextInput = document.getElementById('option-text');

function renderOptions() {
  optionList.innerHTML = '';
  browser.storage.local.get('options').then((result) => {
    const options = result.options || {};
    for (const [name, text] of Object.entries(options)) {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const textCell = document.createElement('td');
      const removeCell = document.createElement('td');
      const removeButton = document.createElement('button');
      const truncatedText = text.length > 250 ? `${text.substr(0, 250)}...` : text;
      const boldName = document.createElement('b');
      boldName.textContent = name;
      nameCell.appendChild(boldName);
      nameCell.appendChild(document.createTextNode(`: ${truncatedText}`));
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        delete options[name];
        browser.storage.local.set({ options });
        renderOptions();
      });
      removeCell.appendChild(removeButton);
      row.appendChild(nameCell);
      row.appendChild(removeCell);
      optionList.appendChild(row);
    }
  });

  const preferencesSection = document.getElementById('preferences');
  const aboutSection = document.getElementById('about');
  const preferencesLink = document.querySelector('#top-nav a[href="#preferences"]');
  const aboutLink = document.querySelector('#top-nav a[href="#about"]');
  if (window.location.hash === '#preferences') {
    preferencesSection.style.display = 'block';
    aboutSection.style.display = 'none';
    preferencesLink.classList.add('selected');
    aboutLink.classList.remove('selected');
  } else {
    preferencesSection.style.display = 'none';
    aboutSection.style.display = 'block';
    aboutLink.classList.add('selected');
    preferencesLink.classList.remove('selected');

    const phrases = [
      "Believe in yourself and all that you are!",
      "Thanks for being you!",
      "You're a shining star!",
      "You're a superstar!",
      "The world needs your talents!",
      "You have the power to achieve your dreams!"
    ];

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    document.getElementById('phrase').textContent = phrase;
  }
}

addOptionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = optionNameInput.value.trim();
  const text = optionTextInput.value.trim();
  if (name && text) {
    browser.storage.local.get('options').then((result) => {
      const options = result.options || {};
      options[name] = text;
      browser.storage.local.set({ options });
      optionNameInput.value = '';
      optionTextInput.value = '';
      renderOptions();
    });
  }
});

document.addEventListener('DOMContentLoaded', renderOptions);

const preferencesLink = document.querySelector('#top-nav a[href="#preferences"]');
preferencesLink.addEventListener('click', () => {
  window.location.hash = '#preferences';
  renderOptions();
});

const aboutLink = document.querySelector('#top-nav a[href="#about"]');
aboutLink.addEventListener('click', () => {
  window.location.hash = '#about';
  renderOptions();
});
