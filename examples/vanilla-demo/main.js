import { createHighlight, isHighlightAPISupported } from 'react-css-highlight/vanilla';
import 'react-css-highlight/styles';

// Browser support check
const browserCheckEl = document.getElementById('browser-check');
const isSupported = isHighlightAPISupported();

if (!isSupported) {
  browserCheckEl.innerHTML = `
    <div class="warning">
      ⚠️ Your browser doesn't support CSS Custom Highlight API.
      Please use Chrome 105+, Edge 105+, or Safari 17.2+
    </div>
  `;
}

// Get DOM elements
const searchInput = document.getElementById('searchInput');
const caseSensitiveCheckbox = document.getElementById('caseSensitive');
const wholeWordCheckbox = document.getElementById('wholeWord');
const updateBtn = document.getElementById('updateBtn');
const clearBtn = document.getElementById('clearBtn');
const destroyBtn = document.getElementById('destroyBtn');
const matchCountEl = document.getElementById('matchCount');
const termCountEl = document.getElementById('termCount');
const contentEl = document.getElementById('content');

// Create highlight controller
let controller = null;

function updateHighlight() {
  const searchValue = searchInput.value.trim();

  if (!searchValue) {
    if (controller) {
      controller.destroy();
      controller = null;
    }
    matchCountEl.textContent = '0';
    termCountEl.textContent = '0';
    return;
  }

  const terms = searchValue.split(',').map(t => t.trim()).filter(Boolean);
  termCountEl.textContent = terms.length;

  if (!controller) {
    // Create new controller
    controller = createHighlight(contentEl, {
      search: terms,
      caseSensitive: caseSensitiveCheckbox.checked,
      wholeWord: wholeWordCheckbox.checked,
      highlightName: 'highlight',
      onHighlightChange: (count) => {
        matchCountEl.textContent = count;
      },
      onError: (err) => {
        console.error('Highlight error:', err);
        alert(`Error: ${err.message}`);
      }
    });
  } else {
    // Update existing controller
    controller.update({
      search: terms,
      caseSensitive: caseSensitiveCheckbox.checked,
      wholeWord: wholeWordCheckbox.checked,
    });
  }
}

// Event listeners
updateBtn.addEventListener('click', updateHighlight);

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    updateHighlight();
  }
});

caseSensitiveCheckbox.addEventListener('change', () => {
  if (controller) {
    controller.update({ caseSensitive: caseSensitiveCheckbox.checked });
  }
});

wholeWordCheckbox.addEventListener('change', () => {
  if (controller) {
    controller.update({ wholeWord: wholeWordCheckbox.checked });
  }
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  if (controller) {
    controller.destroy();
    controller = null;
  }
  matchCountEl.textContent = '0';
  termCountEl.textContent = '0';
});

destroyBtn.addEventListener('click', () => {
  if (controller) {
    controller.destroy();
    controller = null;
  }
  matchCountEl.textContent = '0';
  termCountEl.textContent = '0';
});

// Initialize
updateHighlight();

