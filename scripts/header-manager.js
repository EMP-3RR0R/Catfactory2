import Auth from './auth.js';

const HeaderManager = {
  selectors: {
    navList: '.main-navigation ul',
  },
  
  templates: {
    guest: `
      <li class="menu-login">
        <a href="#" id="login-btn" class="auth-btn">Войти</a>
      </li>
      <li class="menu-register">
        <a href="register.html" id="register-btn">Регистрация</a>
      </li>
    `,
    
    user: (userName) => `
      <li class="menu-profile">
        <a href="user.html">Профиль</a>
      </li>
      <li class="menu-logout">
        <a href="#" id="logout-btn">Выйти</a>
      </li>
    `,
    
    basket: `
      <li class="menu-basket">
        <a href="basket.html">В корзину</a>
      </li>
    `
  },
  
  init() {
    const navList = document.querySelector(this.selectors.navList);
    if (!navList) {
      console.warn('Элемент навигации не найден');
      return;
    }
    
    this.updateHeader(navList);
    
    window.addEventListener('authchange', () => {
      this.updateHeader(navList);
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.id === 'login-btn') {
        e.preventDefault();
        this.handleLoginClick();
      } else if (e.target.id === 'logout-btn') {
        e.preventDefault();
        this.handleLogoutClick();
      }
    });
    
    console.log('HeaderManager инициализирован');
  },
  
  updateHeader(navList) {
    const isLoggedIn = Auth.isLoggedIn();
    
    navList.innerHTML = '';
    
    if (isLoggedIn) {
      const userName = Auth.getCurrentUser()?.name || 'Пользователь';
      const userTemplate = this.templates.user(userName);
      
      navList.innerHTML = userTemplate + this.templates.basket;
      
      this.addGreeting(userName);
      
    } else {
      const guestTemplate = this.templates.guest;
      navList.innerHTML = guestTemplate + this.templates.basket;
      
      this.removeGreeting();
    }
    
    this.updateActiveLink();
  },
  
  addGreeting(userName) {
    this.removeGreeting();
    
    const greeting = document.createElement('li');
    greeting.className = 'menu-greeting';
    greeting.innerHTML = `<span style="color: #fff; font-weight: bold;">Привет, ${userName}!</span>`;
    
    const navList = document.querySelector('.main-navigation ul');
    if (navList && navList.firstChild) {
      navList.insertBefore(greeting, navList.firstChild);
    }
  },
  
  removeGreeting() {
    const greeting = document.querySelector('.menu-greeting');
    if (greeting) {
      greeting.remove();
    }
  },
  
  updateActiveLink() {
    const currentPage = window.location.pathname;
    const links = document.querySelectorAll('.main-navigation a');
    
    links.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      if (href && currentPage.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      }
    });
  },
  
  handleLoginClick() {
    if (typeof window.AuthModal === 'undefined') {
      window.location.href = 'login.html';
    } else {
      window.AuthModal.show('login');
    }
  },
  
  handleLogoutClick() {
    if (confirm('Вы уверены, что хотите выйти?')) {
      Auth.logout();
      
      if (window.location.pathname.includes('user.html')) {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 100);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HeaderManager.init();
});

export default HeaderManager;