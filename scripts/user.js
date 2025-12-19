import Storage from './storage.js';
import Auth from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
  const orderList = document.querySelector('.order-list');
  const userGreeting = document.getElementById('user-greeting');
  const userNameSummary = document.getElementById('user-name-summary');
  const userEmailSummary = document.getElementById('user-email-summary');
  const userPhoneSummary = document.getElementById('user-phone-summary');
  const userAddressSummary = document.getElementById('user-address-summary');
  
  const profileForm = document.getElementById('profile-form');
  const profileNameInput = document.getElementById('profile-name');
  const profileEmailInput = document.getElementById('profile-email');
  const profilePhoneInput = document.getElementById('profile-phone');
  const profileAddressInput = document.getElementById('profile-address');
  const profilePasswordInput = document.getElementById('profile-password');
  const profilePasswordConfirmInput = document.getElementById('profile-password-confirm');
  
  const logoutBtnPage = document.getElementById('logout-btn-page');

  if (!Auth.isLoggedIn()) {
    alert('Для просмотра профиля необходимо войти в аккаунт');
    window.location.href = 'index.html';
    return;
  }
  
  function loadUserData() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    if (userGreeting) userGreeting.textContent = user.name;
    
    if (userNameSummary) userNameSummary.textContent = user.name || 'Не указано';
    if (userEmailSummary) userEmailSummary.textContent = user.email || 'Не указан';
    if (userPhoneSummary) userPhoneSummary.textContent = user.phone || 'Не указан';
    if (userAddressSummary) userAddressSummary.textContent = user.address || 'Не указан';
    
    if (profileNameInput) profileNameInput.value = user.name || '';
    if (profileEmailInput) profileEmailInput.value = user.email || '';
    if (profilePhoneInput) profilePhoneInput.value = user.phone || '';
    if (profileAddressInput) profileAddressInput.value = user.address || '';
    
    if (profilePasswordInput) profilePasswordInput.value = '';
    if (profilePasswordConfirmInput) profilePasswordConfirmInput.value = '';
  }
  
  function loadOrders() {
    const userId = Storage.getCurrentUserId();
    if (!userId) return [];
    
    return Storage.getUserOrders(userId);
  }
  
  function renderOrders() {
    const orders = loadOrders();
    
    orderList.innerHTML = '';
    
    if (orders.length === 0) {
      orderList.innerHTML = `
        <li class="order-item">
          <div style="text-align: center; padding: 2rem; color: #666; width: 100%;">
            <p>У вас пока нет заказов.</p>
            <p>Создайте своего первого котика в конструкторе!</p>
          </div>
        </li>
      `;
      return;
    }
    
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach((order) => {
      const orderContainer = document.createElement('li');
      orderContainer.className = 'order-item';
      orderContainer.style.marginBottom = '2rem';
      orderContainer.style.paddingBottom = '1rem';
      orderContainer.style.borderBottom = '1px solid #eee';
      
      const orderHeader = document.createElement('div');
      orderHeader.style.marginBottom = '1rem';
      orderHeader.innerHTML = `
        <h3 style="color: #ff6b35; margin-bottom: 0.5rem;">Заказ ${order.id}</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: #666; font-size: 0.9rem;">
          <div><strong>Дата:</strong> ${order.date}</div>
          <div><strong>Статус:</strong> <span class="status-${order.status || 'processing'}">${getStatusText(order.status)}</span></div>
          <div><strong>Итого:</strong> ${order.total} ₽</div>
        </div>
        ${order.address ? `<div style="margin-top: 0.5rem;"><strong>Адрес:</strong> ${order.address}</div>` : ''}
      `;
      
      orderContainer.appendChild(orderHeader);
      
      const itemsContainer = document.createElement('div');
      itemsContainer.style.display = 'flex';
      itemsContainer.style.flexDirection = 'column';
      itemsContainer.style.gap = '1rem';
      
      order.items.forEach((item, index) => {
        const catName = item.selects?.catName || `Котик ${index + 1}`;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item-detail';
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        itemElement.style.gap = '1rem';
        itemElement.style.padding = '1rem';
        itemElement.style.background = '#fff8f0';
        itemElement.style.borderRadius = '8px';
        
        let svgPreview = '';
        if (item.svg) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = item.svg;
          const svg = tempDiv.querySelector('svg');
          if (svg) {
            svg.setAttribute('width', '80');
            svg.setAttribute('height', '80');
            svg.style.maxWidth = '80px';
            svg.style.height = 'auto';
            svgPreview = svg.outerHTML;
          }
        }
        
        itemElement.innerHTML = `
          ${svgPreview ? 
            `<div class="order-cat-preview">${svgPreview}</div>` : 
            '<div class="order-cat-preview" style="width: 80px; height: 80px; background: #ffeadd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🐱</div>'}
          <div style="flex: 1;">
            <p style="font-weight: bold; margin-bottom: 0.3rem; color: #ff6b35;">${catName}</p>
            <p style="color: #666; font-size: 0.9rem;">
              <strong>Цена:</strong> ${item.total || 0} ₽
            </p>
          </div>
        `;
        
        itemsContainer.appendChild(itemElement);
      });
      
      orderContainer.appendChild(itemsContainer);
      orderList.appendChild(orderContainer);
    });
  }
  
  function getStatusText(status) {
    switch(status) {
      case 'processing': return 'В обработке';
      case 'shipping': return 'В пути';
      case 'delivered': return 'Доставлен';
      default: return 'В обработке';
    }
  }
  
  function initPhoneMask() {
    if (!profilePhoneInput) return;
    
    profilePhoneInput.addEventListener('input', function(e) {
      let digits = this.value.replace(/\D/g, '');
      
      if (digits.startsWith('7') || digits.startsWith('8')) {
        digits = digits.slice(1);
      }
      
      digits = digits.substring(0, 10);
      
      let formatted = '';
      if (digits.length > 0) {
        formatted = '+7';
        if (digits.length > 0) {
          formatted += ' (' + digits.substring(0, 3);
        }
        if (digits.length > 3) {
          formatted += ') ' + digits.substring(3, 6);
        }
        if (digits.length > 6) {
          formatted += '-' + digits.substring(6, 8);
        }
        if (digits.length > 8) {
          formatted += '-' + digits.substring(8, 10);
        }
      }
      
      this.value = formatted;
      
      setTimeout(() => {
        const len = this.value.length;
        this.setSelectionRange(len, len);
      }, 0);
    });
    
    profilePhoneInput.addEventListener('focus', function() {
      if (!this.value.trim()) {
        this.value = '+7 (';
        setTimeout(() => {
          this.setSelectionRange(4, 4);
        }, 0);
      }
    });
  }
  
  function initProfileForm() {
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const userId = Storage.getCurrentUserId();
      if (!userId) return;
      
      const formData = new FormData(this);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone') || '';
      const address = formData.get('address') || '';
      const password = formData.get('password');
      const passwordConfirm = formData.get('passwordConfirm');
      
      if (!name || !email) {
        showNotification('Поля "Имя" и "Email" обязательны для заполнения', 'error');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Введите корректный email', 'error');
        return;
      }
      
      if (password || passwordConfirm) {
        if (password.length < 6) {
          showNotification('Пароль должен быть не менее 6 символов', 'error');
          return;
        }
        
        if (password !== passwordConfirm) {
          showNotification('Пароли не совпадают', 'error');
          return;
        }
      }
      
      const updates = {
        name,
        email,
        phone,
        address
      };
      
      if (password && password.length >= 6) {
        updates.password = password;
      }
      
      try {
        Storage.updateUser(userId, updates);
        
        loadUserData();
        
        showNotification('Данные профиля успешно обновлены!', 'success');
        
      } catch (error) {
        showNotification('Ошибка при обновлении профиля: ' + error.message, 'error');
      }
    });
  }
  
  function initLogoutButton() {
    if (!logoutBtnPage) return;
    
    logoutBtnPage.addEventListener('click', function() {
      if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        Auth.logout();
        window.location.href = 'index.html';
      }
    });
  }
  
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#ff4757' : '#ff6b35'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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

  loadUserData();
  renderOrders();
  initPhoneMask();
  initProfileForm();
  initLogoutButton();
});