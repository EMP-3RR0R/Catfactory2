let Storage;
try {
  if (typeof window.Storage !== 'undefined') {
    Storage = window.Storage;
  }
} catch (e) {
  console.log('Storage модуль не загружен');
}

document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.form-step');
  const prevButton = document.querySelector('.btn-prev');
  const nextButton = document.querySelector('.btn-next');
  const submitButton = document.querySelector('.btn-submit');
  const exitButton = document.querySelector('.btn-exit');
  let currentStep = 0;
  let hasUnsavedChanges = false;
  const defaultConfig = { selects: {}, colors: {} };
  const prices = { selects: {}, colors: {}, base: 0 };

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateNavigation() {
    prevButton.classList.toggle('hidden', currentStep === 0);
    const hideNext = currentStep === 0 || currentStep === steps.length - 1;
    nextButton.classList.toggle('hidden', hideNext);
    submitButton.classList.toggle('hidden', currentStep !== steps.length - 1);
    if (exitButton) exitButton.classList.toggle('hidden', currentStep < 1);
  }

  function showStep(step) {
    steps.forEach((stepElement, index) => {
      stepElement.classList.toggle('active', index === step);
    });
    updateNavigation();
    if (step === steps.length - 1) {
      renderSummary();
    }
  }

  prevButton.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  showStep(currentStep);

  const startBtn = document.querySelector('.btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      currentStep = 1;
      showStep(currentStep);
    });
  }
  if (exitButton) {
    exitButton.addEventListener('click', () => {
      if (hasUnsavedChanges) {
        const ok = confirm('Есть несохранённые изменения. Выйти без сохранения?');
        if (!ok) return;
      }
      window.location.href = 'index.html';
    });
  }

  document.querySelector('.constructor-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const item = buildCartItem();
      console.log('Сохраняем котика:', item);
      
      const key = 'cartItems';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      console.log('Существующие товары в корзине:', existing.length);
      
      item.id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      existing.push(item);
      
      localStorage.setItem(key, JSON.stringify(existing));
      hasUnsavedChanges = false;
      
      console.log('Котик добавлен в корзину, всего товаров:', existing.length);
      
      showAddToCartNotification();
      
      setTimeout(() => {
        if (confirm('Котик добавлен в корзину! Перейти в корзину для оформления заказа?')) {
          window.location.href = 'basket.html';
        }
      }, 1500);
      
    } catch (err) {
      console.error('Failed to save item to cart', err);
      alert('Не удалось сохранить в корзину. Попробуйте ещё раз.');
    }
  });

  const settings = {};
  function addSetting(key, selectSelector, optionMap) {
    const select = document.querySelector(selectSelector);
    if (!select || select.tagName !== 'SELECT') return;
    const options = {};
    Object.keys(optionMap).forEach(optKey => {
      const el = document.querySelector(optionMap[optKey]);
      if (el) options[optKey] = el;
    });
    settings[key] = { select, options };
  }

  addSetting('ears', '#ears', {
    normal: '#earsNormal',
    tufted: '#earsTufted',
    folded: '#earsFolded',
    none: '#earsNone',
  });

  addSetting('eyes', '#eyes', {
    round: '#eyesRound',
    sly: '#eyesSly',
    happy: '#eyesHappy',
  });

  addSetting('nose', '#nose', {
    triangle: '#noseTriangle',
    round: '#noseRound',
  });

  addSetting('mouth', '#mouth', {
    neutral: '#mouthNeutral',
    smile: '#mouthSmile',
    sad: '#mouthSad',
  });

  addSetting('tail', '#tail', {
    long: '#tailLong',
    short: '#tailShort',
    none: '#tailNone',
  });

  addSetting('tailPattern', '#tail-pattern', {
    plain: '#tailPlain',
    striped: '#tailStriped',
  });

  (function initPricesAndDefaults() {
    prices.base = randInt(3000, 10000);

    Object.keys(settings).forEach(key => {
      const s = settings[key];
      if (!s || !s.select) return;
      defaultConfig.selects[key] = s.select.value;
      prices.selects[key] = {};
      const opts = s.select && s.select.options ? Array.from(s.select.options) : [];
      opts.forEach(opt => {
        const val = opt.value;
        prices.selects[key][val] = randInt(100, 1000);
      });
    });

    const colorInputs = ['#fur-color','#ears-color','#tail-color','#stripes-color','#belly-color','#paws-color','#tapochki-color','#nose-color'];
    colorInputs.forEach(sel => {
      const input = document.querySelector(sel);
      if (!input) return;
      defaultConfig.colors[sel.replace('#','')] = input.value;
      prices.colors[sel.replace('#','')] = randInt(50, 400);
    });
  })();

  function renderOptionPrices(settingKey) {
    const setting = settings[settingKey];
    if (!setting || !setting.select) return;
    const select = setting.select;
    let container = select.parentNode.querySelector('.option-price-list');
    if (!container) {
      container = document.createElement('div');
      container.className = 'option-price-list';
      container.style.marginTop = '0.25rem';
      container.style.fontSize = '0.85em';
      container.style.opacity = '0.8';
      select.parentNode.insertBefore(container, select.nextSibling);
    } else {
      container.innerHTML = '';
    }
    const map = prices.selects[settingKey] || {};
    Array.from(select.options).forEach(opt => {
      const val = opt.value;
      const txt = opt.text;
      const extra = map[val] || 0;
      const row = document.createElement('div');
      row.textContent = `${txt}: +${extra} ₽`;
      container.appendChild(row);
    });
  }

  function updateSetting(settingKey, selectedValue) {
    const setting = settings[settingKey];
    if (!setting) return;
    if (selectedValue == null) {
      try { selectedValue = setting.select ? setting.select.value : selectedValue; } catch (e) {}
    }

    const opts = Object.values(setting.options || {});
    if (opts.length > 0) {
      opts.forEach(option => {
        try { option.classList.add('hidden'); option.style.display = 'none'; } catch (e) {}
      });
      const target = setting.options[selectedValue];
      if (target) {
        try { target.classList.remove('hidden'); target.style.display = ''; } catch (e) {}
        return;
      }
    }

    try {
      const groupEls = document.querySelectorAll('.' + settingKey);
      if (groupEls && groupEls.length) {
        groupEls.forEach(el => { try { el.classList.add('hidden'); el.style.display = 'none'; } catch (e) {} });
      }
    } catch (e) {}

    if (typeof selectedValue !== 'string') {
      console.debug(`updateSetting: invalid selectedValue for ${settingKey}`, selectedValue);
      return;
    }
    const cap = selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1);
    let candidate = document.getElementById(settingKey + cap);
    if (!candidate) {
      candidate = document.getElementById(selectedValue + cap);
    }
    if (candidate) {
      try { candidate.classList.remove('hidden'); candidate.style.display = ''; } catch (e) {}
      return;
    }

    console.debug(`updateSetting: unable to find target for ${settingKey} -> ${selectedValue}`);
  }

  Object.keys(settings).forEach(settingKey => {
    const setting = settings[settingKey];
    if (!setting || !setting.select) return;
    setting.select.addEventListener('change', (event) => {
      console.debug(`change fired for ${settingKey}:`, event.target.value);
      updateSetting(settingKey, event.target.value);
      updateInlinePrice(settingKey);
      renderOptionPrices(settingKey);
      hasUnsavedChanges = true;
    });

    (function ensurePriceEl() {
      let el = setting.select.nextElementSibling;
      if (!el || !el.classList || !el.classList.contains('option-price')) {
        el = document.createElement('span');
        el.className = 'option-price';
        setting.select.parentNode.insertBefore(el, setting.select.nextSibling);
      }
    })();

    updateSetting(settingKey, setting.select.value);
    updateInlinePrice(settingKey);
    renderOptionPrices(settingKey);
  });

  function renderSummary() {
    const mapText = (selector, targetId) => {
      const el = document.querySelector(selector);
      const out = document.getElementById(targetId);
      if (!out) return;
      if (!el) { out.textContent = ''; return; }
      const text = el.options ? el.options[el.selectedIndex].text : el.value;
      out.textContent = text;
    };

    mapText('#ears', 'summary-ears');
    mapText('#eyes', 'summary-eyes');
    mapText('#nose', 'summary-nose');
    mapText('#mouth', 'summary-mouth');
    mapText('#tail', 'summary-tail');
    mapText('#tail-pattern', 'summary-tail-pattern');

    const mapColor = (inputSelector, targetId) => {
      const input = document.querySelector(inputSelector);
      const out = document.getElementById(targetId);
      if (!out) return;
      out.textContent = input ? input.value : '';
      if (input && input.value) {
        out.style.background = input.value;
        out.style.color = getContrastingColor(input.value);
        out.style.padding = '0.1rem 0.4rem';
        out.style.borderRadius = '4px';
        out.style.display = 'inline-block';
      } else {
        out.style.background = '';
      }
    };

    mapColor('#fur-color', 'summary-furColor');
    mapColor('#ears-color', 'summary-earsColor');
    mapColor('#tail-color', 'summary-tailColor');
    mapColor('#stripes-color', 'summary-stripesColor');
    mapColor('#belly-color', 'summary-bellyColor');
    mapColor('#paws-color', 'summary-pawsColor');
    mapColor('#tapochki-color', 'summary-tapochkiColor');
    mapColor('#nose-color', 'summary-noseColor');

    const preview = document.getElementById('summary-preview');
    const svg = document.querySelector('.cat-constructor');
    if (preview && svg) {
      preview.innerHTML = '';
      const clone = svg.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.maxWidth = '220px';
      clone.style.width = '100%';
      clone.style.height = 'auto';
      preview.appendChild(clone);
    }

    const breakdownEl = document.getElementById('price-breakdown');
    const totalEl = document.getElementById('summary-total');
    if (breakdownEl) breakdownEl.innerHTML = '';
    let total = prices.base;
    if (breakdownEl) {
      const li = document.createElement('li');
      li.textContent = `Базовая цена кота: ${prices.base} ₽`;
      breakdownEl.appendChild(li);
    }

    Object.keys(settings).forEach(key => {
      const s = settings[key];
      if (!s || !s.select) return;
      const cur = s.select.value;
      const def = defaultConfig.selects[key];
      if (cur !== def) {
        const extra = (prices.selects[key] && prices.selects[key][cur]) ? prices.selects[key][cur] : 0;
        total += extra;
        if (breakdownEl) {
          const labelText = `${s.select.options[s.select.selectedIndex].text} (${key})`;
          const li = document.createElement('li');
          li.textContent = `${labelText}: +${extra} ₽`;
          breakdownEl.appendChild(li);
        }
      }
    });

    const colorKeys = Object.keys(defaultConfig.colors);
    colorKeys.forEach(k => {
      const sel = `#${k}`;
      const input = document.querySelector(sel);
      if (!input) return;
      const def = defaultConfig.colors[k];
      if (input.value !== def) {
        const extra = prices.colors[k] || 0;
        total += extra;
        if (breakdownEl) {
          const li = document.createElement('li');
          li.textContent = `Изменён цвет ${k.replace('-',' ')}: +${extra} ₽`;
          breakdownEl.appendChild(li);
        }
      }
    });

    if (totalEl) {
      totalEl.textContent = `Итого: ${total} ₽`;
      totalEl.style.fontWeight = '700';
      totalEl.style.marginTop = '0.6rem';
    }
  }

  function buildCartItem() {
    const selects = {};
    Object.keys(settings).forEach(key => {
      const s = settings[key];
      if (!s || !s.select) return;
      const val = s.select.value;
      const text = s.select.options[s.select.selectedIndex]?.text || val;
      selects[key] = { value: val, label: text };
    });
    const colors = {};
    ['fur-color','ears-color','tail-color','stripes-color','belly-color','paws-color','tapochki-color','nose-color']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) colors[id] = el.value;
      });

    let total = prices.base;
    const breakdown = [];
    breakdown.push({ label: 'Базовая цена кота', amount: prices.base });
    Object.keys(settings).forEach(key => {
      const s = settings[key];
      if (!s || !s.select) return;
      const cur = s.select.value;
      const def = defaultConfig.selects[key];
      if (cur !== def) {
        const extra = (prices.selects[key] && prices.selects[key][cur]) ? prices.selects[key][cur] : 0;
        total += extra;
        breakdown.push({ label: `${s.select.options[s.select.selectedIndex].text} (${key})`, amount: extra });
      }
    });
    Object.keys(defaultConfig.colors).forEach(k => {
      const input = document.getElementById(k);
      if (!input) return;
      const def = defaultConfig.colors[k];
      if (input.value !== def) {
        const extra = prices.colors[k] || 0;
        total += extra;
        breakdown.push({ label: `Изменён цвет ${k.replace('-',' ')}`, amount: extra });
      }
    });

    const svg = document.querySelector('.cat-constructor');
    const svgHtml = svg ? svg.outerHTML : '';

    const item = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      selects,
      colors,
      basePrice: prices.base,
      breakdown,
      total,
      svg: svgHtml,
      createdAt: new Date().toISOString()
    };
    
    console.log('Создан товар для корзины:', item);
    return item;
  }

  function getContrastingColor(hex) {
    if (!hex) return '#000';
    const c = hex.replace('#','');
    const r = parseInt(c.substr(0,2),16);
    const g = parseInt(c.substr(2,2),16);
    const b = parseInt(c.substr(4,2),16);
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  }

  const colorMappings = [
    { input: '#fur-color', targets: ['#body', '#bodyMain'] },
    { input: '#ears-color', targets: ['#earsNormal', '#earsTufted', '#earsFolded', '#earsNone'] },
    { input: '#tail-color', targets: ['#tailLong', '#tailShort', '#tailNone'] },
    { input: '#stripes-color', targets: ['#stripes', '#stripe1Left', '#stripe2Left', '#stripe1Right', '#stripe2Right'] },
    { input: '#belly-color', targets: ['#belly', '#bellyMain'] },
    { input: '#paws-color', targets: ['#backLeftPaw', '#backRightPaw', '#frontLeftPaw', '#frontRightPaw'] },
    { input: '#tapochki-color', targets: ['#backLeftTapochka', '#backRightTapochka', '#frontLeftTapochka', '#frontRightTapochka'] },
    { input: '#nose-color', targets: ['#noseTriangle', '#noseRound', '#noseRoundPath'] },
  ];

  colorMappings.forEach(mapping => {
    const input = document.querySelector(mapping.input);
    if (!input) return;
    const applyColor = (value) => {
      mapping.targets.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.color = value;
        });
      });
    };
    input.addEventListener('input', (e) => {
      applyColor(e.target.value);
      updateInlineColorPrice(input);
      hasUnsavedChanges = true;
    });
    applyColor(input.value);
    (function ensureColorPriceEl() {
      let el = input.nextElementSibling;
      if (!el || !el.classList || !el.classList.contains('option-price')) {
        el = document.createElement('span');
        el.className = 'option-price';
        input.parentNode.insertBefore(el, input.nextSibling);
      }
      updateInlineColorPrice(input);
    })();
  });

  function updateInlinePrice(settingKey) {
    const setting = settings[settingKey];
    if (!setting || !setting.select) return;
    const select = setting.select;
    const cur = select.value;
    const def = defaultConfig.selects[settingKey];
    const span = select.parentNode.querySelector('.option-price');
    if (!span) return;
    const extra = (prices.selects[settingKey] && prices.selects[settingKey][cur]) ? prices.selects[settingKey][cur] : 0;
    span.textContent = `+${extra} ₽`;
    span.style.display = 'inline-block';
  }

  function updateInlineColorPrice(input) {
    if (!input) return;
    const key = input.id;
    const def = defaultConfig.colors[key];
    const span = input.parentNode.querySelector('.option-price');
    if (!span) return;
    const extra = prices.colors[key] || 0;
    span.textContent = `+${extra} ₽`;
    span.style.display = 'inline-block';
  }

  function showAddToCartNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 1.5rem;">✓</span>
      <div>
        <strong>Котик добавлен в корзину!</strong><br>
        <small>Перейдите в корзину для оформления заказа</small>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    if (!document.getElementById('cart-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'cart-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  (function moveTailToBack() {
    const svg = document.querySelector('.cat-constructor');
    if (!svg) return;
    ['tailLong', 'tailShort', 'tailNone'].forEach(id => {
      const node = document.getElementById(id);
      if (node) svg.insertBefore(node, svg.firstChild);
    });
  })();
  
  window.debugCartData = function() {
    console.log('=== ДЕБАГ ДАННЫХ КОРЗИНЫ ===');
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    console.log('Товаров в корзине:', cartItems.length);
    console.log('Все товары:', cartItems);
    console.log('localStorage.cartItems:', localStorage.getItem('cartItems'));
    
    if (typeof Storage !== 'undefined') {
      console.log('Storage доступен:', Storage);
      console.log('Storage.getCurrentCart?', typeof Storage.getCurrentCart);
    }
    
    return cartItems;
  };
});