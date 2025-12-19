const Storage = {
  getAllUsers() {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Ошибка при чтении пользователей:', error);
      return [];
    }
  },
  
  findUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  },
  
  createUser(userData) {
    const users = this.getAllUsers();
    
    if (this.findUserByEmail(userData.email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Пароль должен быть не менее 6 символов');
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return newUser;
  },
  
  updateUser(userId, updates) {
    const users = this.getAllUsers();
    const index = users.findIndex(user => user.id === userId);
    
    if (index !== -1) {
      if (updates.email && updates.email !== users[index].email) {
        const existingUser = this.findUserByEmail(updates.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Пользователь с таким email уже существует');
        }
      }
      
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
  },
  
  getCurrentUserId() {
    return localStorage.getItem('currentUser');
  },
  
  setCurrentUser(userId) {
    if (userId === null) {
      localStorage.removeItem('currentUser');
    } else {
      localStorage.setItem('currentUser', userId);
    }
  },
  
  getCurrentUser() {
    const userId = this.getCurrentUserId();
    if (!userId) return null;
    
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  },
  
  getUserCart(userId) {
    try {
      const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
      return userCarts[userId] || [];
    } catch (error) {
      console.error('Ошибка при чтении корзины пользователя:', error);
      return [];
    }
  },
  
  saveUserCart(userId, cartItems) {
    try {
      const userCarts = JSON.parse(localStorage.getItem('userCarts') || '{}');
      userCarts[userId] = cartItems;
      localStorage.setItem('userCarts', JSON.stringify(userCarts));
    } catch (error) {
      console.error('Ошибка при сохранении корзины пользователя:', error);
    }
  },
  
  getGuestCart() {
    try {
      return JSON.parse(sessionStorage.getItem('guestCart') || '[]');
    } catch (error) {
      console.error('Ошибка при чтении гостевой корзины:', error);
      return [];
    }
  },
  
  saveGuestCart(cartItems) {
    try {
      sessionStorage.setItem('guestCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Ошибка при сохранении гостевой корзины:', error);
    }
  },
  
  getCurrentCart() {
    const userId = this.getCurrentUserId();
    if (userId) {
      return this.getUserCart(userId);
    } else {
      return this.getGuestCart();
    }
  },
  
  saveCurrentCart(cartItems) {
    const userId = this.getCurrentUserId();
    if (userId) {
      this.saveUserCart(userId, cartItems);
    } else {
      this.saveGuestCart(cartItems);
    }
  },
  
  addToCurrentCart(item) {
    const cart = this.getCurrentCart();
    cart.push(item);
    this.saveCurrentCart(cart);
  },
  
  clearCurrentCart() {
    this.saveCurrentCart([]);
  },
  
  getUserOrders(userId) {
    try {
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '{}');
      return userOrders[userId] || [];
    } catch (error) {
      console.error('Ошибка при чтении заказов пользователя:', error);
      return [];
    }
  },
  
  addUserOrder(userId, orderData) {
    try {
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '{}');
      const orders = userOrders[userId] || [];
      
      const orderWithId = {
        ...orderData,
        id: 'ORD-' + Date.now().toString().slice(-8),
        date: new Date().toLocaleString('ru-RU'),
        status: 'processing'
      };
      
      orders.unshift(orderWithId);
      userOrders[userId] = orders;
      localStorage.setItem('userOrders', JSON.stringify(userOrders));
      
      return orderWithId;
    } catch (error) {
      console.error('Ошибка при сохранении заказа:', error);
      throw error;
    }
  },
  
  migrateOldData() {
    const oldCart = localStorage.getItem('cartItems');
    if (oldCart) {
      try {
        const cartItems = JSON.parse(oldCart);
        const userId = this.getCurrentUserId();
        
        if (userId) {
          this.saveUserCart(userId, cartItems);
        } else {
          this.saveGuestCart(cartItems);
        }
        
        localStorage.removeItem('cartItems');
        console.log('Старая корзина успешно мигрирована');
      } catch (error) {
        console.error('Ошибка миграции корзины:', error);
      }
    }
    
    const oldOrders = localStorage.getItem('userOrders');
    if (oldOrders) {
      try {
        const orders = JSON.parse(oldOrders);
        const userId = this.getCurrentUserId();
        
        if (userId && Array.isArray(orders)) {
          const userOrders = JSON.parse(localStorage.getItem('userOrders') || '{}');
          userOrders[userId] = orders;
          localStorage.setItem('userOrders', JSON.stringify(userOrders));
          localStorage.removeItem('userOrders');
          console.log('Старые заказы успешно мигрированы');
        }
      } catch (error) {
        console.error('Ошибка миграции заказов:', error);
      }
    }
    
    const oldUserName = localStorage.getItem('userName');
    const oldUserEmail = localStorage.getItem('userEmail');
    const oldUserPhone = localStorage.getItem('userPhone');
    const oldUserAddress = localStorage.getItem('userAddress');
    
    if (oldUserName || oldUserEmail) {
      const userId = this.getCurrentUserId();
      if (userId) {
        const updates = {};
        if (oldUserName) updates.name = oldUserName;
        if (oldUserEmail) updates.email = oldUserEmail;
        if (oldUserPhone) updates.phone = oldUserPhone;
        if (oldUserAddress) updates.address = oldUserAddress;
        
        this.updateUser(userId, updates);
        
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userAddress');
        console.log('Старые данные профиля мигрированы');
      }
    }
  },

  init() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('userCarts')) {
      localStorage.setItem('userCarts', JSON.stringify({}));
    }
    if (!localStorage.getItem('userOrders')) {
      localStorage.setItem('userOrders', JSON.stringify({}));
    }
    if (!sessionStorage.getItem('guestCart')) {
      sessionStorage.setItem('guestCart', JSON.stringify([]));
    }
    
    this.migrateOldData();
    
    console.log('Хранилище инициализировано');
  }
};

Storage.init();

if (typeof window !== 'undefined') {
  window.Storage = Storage;
}

export default Storage;