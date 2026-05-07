import {
  createCompareHighlight,
  createHighlight,
  isHighlightAPISupported,
} from 'react-css-highlight/vanilla';
import 'react-css-highlight/styles';

const COMPARE_BASE_INITIAL =
  'The CSS Custom Highlight API provides a modern way to highlight text in web pages. It uses Range objects and the CSS highlights registry to apply styles without modifying the DOM structure. This approach is fast, efficient, and non-invasive.';

const COMPARE_MODIFIED_INITIAL =
  'The CSS Custom Highlight API offers a modern way to highlight text in web applications. It uses Range objects and the CSS highlights registry to apply visual styles without modifying the DOM. This approach is fast and non-invasive.';

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

/* --- String comparison demo (positional diff, two contenteditable nodes) --- */

function initCompareDemo() {
  if (!isSupported) {
    return;
  }

  const baseEl = document.getElementById('compareBase');
  const modEl = document.getElementById('compareModified');
  const diffEl = document.getElementById('compareDiffCount');
  const baseLenEl = document.getElementById('compareBaseLen');
  const compareLenEl = document.getElementById('compareModifiedLen');
  const resetBtn = document.getElementById('compareResetBtn');

  if (!baseEl || !modEl || !diffEl || !baseLenEl || !compareLenEl || !resetBtn) {
    return;
  }

  function updateLen() {
    baseLenEl.textContent = String(baseEl.textContent?.length ?? 0);
    compareLenEl.textContent = String(modEl.textContent?.length ?? 0);
  }

  const compareCtrl = createCompareHighlight(baseEl, modEl, {
    onDiffChange(count) {
      diffEl.textContent = String(count);
      updateLen();
    },
    onError: (err) => {
      console.error('Compare highlight error:', err);
    },
  });

  let debounceId;
  function scheduleRefresh() {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      compareCtrl.refresh();
    }, 150);
  }

  baseEl.addEventListener('input', scheduleRefresh);
  modEl.addEventListener('input', scheduleRefresh);

  resetBtn.addEventListener('click', () => {
    baseEl.textContent = COMPARE_BASE_INITIAL;
    modEl.textContent = COMPARE_MODIFIED_INITIAL;
    compareCtrl.refresh();
  });
}

initCompareDemo();

