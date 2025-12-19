import Auth from './auth.js';

const AuthModal = {
  config: {
    modalId: 'auth-modal',
    modalTitleId: 'auth-modal-title',
    modalContentId: 'auth-modal-content',
    closeBtnClass: 'auth-modal-close'
  },
  
  currentTab: 'login',
  
  init() {
    this.createModalHTML();
    
    this.addStyles();
    
    this.bindEvents();
    
    console.log('AuthModal инициализирован');
  },
  
  createModalHTML() {
    if (document.getElementById(this.config.modalId)) {
      return;
    }
    
    const modalHTML = `
      <div id="${this.config.modalId}" class="auth-modal" aria-hidden="true">
        <div class="auth-modal__overlay"></div>
        <div class="auth-modal__content">
          <button class="${this.config.closeBtnClass}" aria-label="Закрыть окно">×</button>
          
          <div class="auth-modal__tabs">
            <button class="auth-tab auth-tab--active" data-tab="login">Вход</button>
            <button class="auth-tab" data-tab="register">Регистрация</button>
          </div>
          
          <h2 id="${this.config.modalTitleId}" class="auth-modal__title">Вход в аккаунт</h2>
          
          <div id="${this.config.modalContentId}" class="auth-modal__body">
            <!-- Контент будет заполнен динамически -->
          </div>
          
          <div class="auth-modal__footer">
            <p class="auth-modal__fallback">
              Проблемы с модалкой? 
              <a href="login.html" class="auth-modal__fallback-link">Войти на отдельной странице</a> или 
              <a href="register.html" class="auth-modal__fallback-link">Зарегистрироваться</a>
            </p>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.renderContent('login');
  },
  
  addStyles() {
    if (document.getElementById('auth-modal-styles')) {
      return;
    }
    
    const styles = `
      .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        box-sizing: border-box;
      }
      
      .auth-modal[aria-hidden="false"] {
        display: flex;
      }
      
      .auth-modal__overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }
      
      .auth-modal__content {
        position: relative;
        background: white;
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 10px 40px rgba(255, 107, 53, 0.3);
        border-top: 8px solid #ff6b35;
        animation: modalAppear 0.4s ease-out;
        z-index: 2001;
      }
      
      .auth-modal__close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        color: #999;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
      }
      
      .auth-modal__close:hover {
        color: #ff6b35;
        background: #fff5f0;
      }
      
      .auth-modal__tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid #ffeadd;
        padding-bottom: 0.5rem;
      }
      
      .auth-tab {
        flex: 1;
        padding: 0.8rem 1rem;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        font-size: 1.1rem;
        color: #666;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 6px 6px 0 0;
      }
      
      .auth-tab:hover {
        background: #fff5f0;
        color: #ff6b35;
      }
      
      .auth-tab--active {
        color: #ff6b35;
        border-bottom-color: #ff6b35;
        background: #fff5f0;
        font-weight: bold;
      }
      
      .auth-modal__title {
        color: #ff6b35;
        font-size: 1.8rem;
        text-align: center;
        margin-bottom: 1.5rem;
      }
      
      .auth-modal__body {
        margin-bottom: 1.5rem;
      }
      
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
      }
      
      .auth-form .form-field {
        display: flex;
        flex-direction: column;
      }
      
      .auth-form label {
        color: #ff6b35;
        font-weight: 600;
        margin-bottom: 0.3rem;
        font-size: 0.95rem;
      }
      
      .auth-form input {
        padding: 0.9rem;
        border: 2px solid #ffdecd;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }
      
      .auth-form input:focus {
        border-color: #ff6b35;
        outline: none;
        background: #fff8f0;
      }
      
      .auth-form__button {
        background: #ff6b35;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 1rem;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s;
        margin-top: 0.5rem;
      }
      
      .auth-form__button:hover {
        background: #ff935f;
      }
      
      .auth-form__error {
        color: #ff4757;
        font-size: 0.9rem;
        margin-top: 0.3rem;
        padding: 0.5rem;
        background: rgba(255, 71, 87, 0.1);
        border-radius: 4px;
        display: none;
      }
      
      .auth-form__error--visible {
        display: block;
      }
      
      .auth-form__success {
        color: #27ae60;
        text-align: center;
        padding: 1rem;
        background: rgba(39, 174, 96, 0.1);
        border-radius: 8px;
        margin-top: 1rem;
        display: none;
      }
      
      .auth-form__success--visible {
        display: block;
      }
      
      .auth-modal__footer {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #eee;
        text-align: center;
      }
      
      .auth-modal__fallback {
        color: #666;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .auth-modal__fallback-link {
        color: #ff6b35;
        text-decoration: none;
        font-weight: bold;
      }
      
      .auth-modal__fallback-link:hover {
        text-decoration: underline;
      }
      
      @keyframes modalAppear {
        from {
          opacity: 0;
          transform: translateY(-30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @media (max-width: 600px) {
        .auth-modal__content {
          padding: 1.5rem;
          border-radius: 15px;
        }
        
        .auth-modal__title {
          font-size: 1.5rem;
        }
        
        .auth-tab {
          padding: 0.6rem 0.8rem;
          font-size: 1rem;
        }
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'auth-modal-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  },
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      const modal = document.getElementById(this.config.modalId);
      
      if (e.target.classList.contains(this.config.closeBtnClass) || 
          e.target.classList.contains('auth-modal__overlay')) {
        this.hide();
      }
      
      if (e.target.classList.contains('auth-tab')) {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
    
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('auth-form')) {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      }
    });
  },
  
  show(tab = 'login') {
    const modal = document.getElementById(this.config.modalId);
    if (!modal) {
      console.error('Модалка не найдена');
      window.location.href = tab === 'login' ? 'login.html' : 'register.html';
      return;
    }
    
    this.switchTab(tab);
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  },
  
  hide() {
    const modal = document.getElementById(this.config.modalId);
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      this.clearForm();
    }
  },
  
  isVisible() {
    const modal = document.getElementById(this.config.modalId);
    return modal ? modal.getAttribute('aria-hidden') === 'false' : false;
  },
  
  switchTab(tab) {
    if (!['login', 'register'].includes(tab)) return;
    
    this.currentTab = tab;
    
    document.querySelectorAll('.auth-tab').forEach(btn => {
      btn.classList.toggle('auth-tab--active', btn.dataset.tab === tab);
    });
    
    const title = document.getElementById(this.config.modalTitleId);
    if (title) {
      title.textContent = tab === 'login' ? 'Вход в аккаунт' : 'Регистрация';
    }
    
    this.renderContent(tab);
  },
  
  renderContent(tab) {
    const contentEl = document.getElementById(this.config.modalContentId);
    if (!contentEl) return;
    
    if (tab === 'login') {
      contentEl.innerHTML = `
        <form class="auth-form" id="login-form">
          <div class="form-field">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" name="email" required placeholder="example@mail.ru">
          </div>
          
          <div class="form-field">
            <label for="login-password">Пароль</label>
            <input type="password" id="login-password" name="password" required placeholder="Не менее 6 символов" minlength="6">
          </div>
          
          <div class="auth-form__error" id="login-error"></div>
          <div class="auth-form__success" id="login-success">Вход выполнен успешно!</div>
          
          <button type="submit" class="auth-form__button">Войти</button>
        </form>
      `;
    } else {
      contentEl.innerHTML = `
        <form class="auth-form" id="register-form">
          <div class="form-field">
            <label for="register-name">Имя</label>
            <input type="text" id="register-name" name="name" required placeholder="Как вас зовут?">
          </div>
          
          <div class="form-field">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" name="email" required placeholder="example@mail.ru">
          </div>
          
          <div class="form-field">
            <label for="register-password">Пароль</label>
            <input type="password" id="register-password" name="password" required placeholder="Не менее 6 символов"