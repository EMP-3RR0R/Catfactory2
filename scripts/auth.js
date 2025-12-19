import Storage from './storage.js';

const Auth = {
  register(userData) {
    try {
      const newUser = Storage.createUser(userData);
      
      Storage.setCurrentUser(newUser.id);
      
      const guestCart = Storage.getGuestCart();
      if (guestCart.length > 0) {
        Storage.saveUserCart(newUser.id, guestCart);
        Storage.saveGuestCart([]);
        console.log('Корзина гостя перенесена в профиль пользователя');
      }
      
      this.dispatchAuthChange();
      
      return newUser;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  },
  
  login(email, password) {
    try {
      const user = Storage.findUserByEmail(email);
      
      if (!user) {
        throw new Error('Пользователь с таким email не найден');
      }
      
      if (user.password !== password) {
        throw new Error('Неверный пароль');
      }
      
      Storage.setCurrentUser(user.id);
      
      this.dispatchAuthChange();
      
      return user;
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  },
  
  loginAsGuest() {
    Storage.setCurrentUser(null);
    this.dispatchAuthChange();
  },
  
  logout() {
  const userId = Storage.getCurrentUserId();
  
  if (userId) {
    const userCart = Storage.getCurrentCart();
    Storage.saveUserCart(userId, userCart);
    
    Storage.setCurrentUser(null);
    
    const event = new CustomEvent('cartupdate', {
      detail: { cart: Storage.getCurrentCart() }
    });
    window.dispatchEvent(event);
    
    this.dispatchAuthChange();
    
    console.log('Пользователь вышел, корзина сохранена и обновлена');
  }
},
  
  isLoggedIn() {
    return Storage.getCurrentUserId() !== null;
  },
  
  getCurrentUser() {
    return Storage.getCurrentUser();
  },
  
  getUserGreeting() {
    const user = this.getCurrentUser();
    return user ? user.name : 'Гость';
  },
  
  dispatchAuthChange() {
    const event = new CustomEvent('authchange', {
      detail: { 
        isLoggedIn: this.isLoggedIn(),
        user: this.getCurrentUser() 
      }
    });
    window.dispatchEvent(event);
  },
  
  init() {
    console.log('Модуль авторизации инициализирован');
    
    this.dispatchAuthChange();
  }
};

Auth.init();

if (typeof window !== 'undefined') {
  window.Auth = Auth;
}

export default Auth;