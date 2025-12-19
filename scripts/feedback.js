document.addEventListener('DOMContentLoaded', function() {
  const feedbackForm = document.querySelector('.feedback-form');
  const modal = document.getElementById('feedback-modal');
  const modalCloseBtn = document.querySelector('.modal__close');
  const modalCloseBtn2 = document.getElementById('modal-close-btn');
  const modalName = document.getElementById('modal-name');
  const modalPhone = document.getElementById('modal-phone');
  const modalEmail = document.getElementById('modal-email');
  
  feedbackForm.setAttribute('novalidate', 'novalidate');
  
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const consentInput = document.getElementById('consent');
  
  nameInput.removeAttribute('required');
  phoneInput.removeAttribute('required');
  emailInput.removeAttribute('required');
  phoneInput.removeAttribute('pattern');
  
  let wasPlusSevenAdded = false;
  
  phoneInput.addEventListener('input', function(e) {
  const input = e.target;

  let digits = input.value.replace(/\D/g, '');

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

  input.value = formatted;

  setTimeout(() => {
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }, 0);
});

  
  phoneInput.addEventListener('focus', function() {
    if (!this.value.trim()) {
      this.value = '+7 (';
      wasPlusSevenAdded = true;
      setTimeout(() => {
        this.setSelectionRange(4, 4);
      }, 0);
    }
  });
  
  phoneInput.addEventListener('click', function() {
    setTimeout(() => {
      const len = this.value.length;
      this.setSelectionRange(len, len);
    }, 0);
  });
  
  function calculateCursorPosition(oldPos, oldValue, newValue) {
    const nonDigitsBefore = (oldValue.substring(0, oldPos).match(/\D/g) || []).length;
    
    let nonDigitsCount = 0;
    for (let i = 0; i < newValue.length; i++) {
      if (/\D/.test(newValue[i])) {
        nonDigitsCount++;
      }
      if (nonDigitsCount === nonDigitsBefore) {
        return i + 1;
      }
    }
    
    return newValue.length;
  }
  
  function validateForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
      highlightField(nameInput, true);
    } else {
      highlightField(nameInput, false);
    }
    
    if (!formData.phone) {
      errors.push('Введите номер телефона');
      highlightField(phoneInput, true);
    } else {
      const phoneRegex = /^\+7\s\([0-9]{3}\)\s[0-9]{3}-[0-9]{2}-[0-9]{2}$/;
      const phoneDigits = formData.phone.replace(/\D/g, '');
      
      if (!phoneRegex.test(formData.phone)) {
        errors.push('Введите номер в формате: +7 (999) 123-45-67');
        highlightField(phoneInput, true);
      } else if (phoneDigits.length !== 11) {
        errors.push('Номер должен содержать 10 цифр после +7');
        highlightField(phoneInput, true);
      } else {
        const phoneWithoutFormatting = formData.phone.replace(/\s|\(|\)|-/g, '');
        const regionCode = phoneWithoutFormatting.substring(2, 5); 
        
        if (regionCode[0] !== '9') {
          errors.push('Код региона должен начинаться с цифры 9');
          highlightField(phoneInput, true);
        } else {
          highlightField(phoneInput, false);
        }
      }
    }
    
    if (!formData.email) {
      errors.push('Введите email');
      highlightField(emailInput, true);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Введите корректный email (например: example@mail.ru)');
        highlightField(emailInput, true);
      } else {
        highlightField(emailInput, false);
      }
    }
    
    if (!formData.consent) {
      errors.push('Необходимо согласие на обработку данных');
      highlightField(consentInput, true);
    } else {
      highlightField(consentInput, false);
    }
    
    return errors;
  }
  
  function highlightField(field, hasError) {
    if (!field) return;
    
    if (hasError) {
      field.style.borderColor = '#ff4757';
      field.style.boxShadow = '0 0 0 2px rgba(255, 71, 87, 0.2)';
    } else {
      field.style.borderColor = '#ffdecd';
      field.style.boxShadow = 'none';
    }
  }
  
  function resetFieldHighlights() {
    [nameInput, phoneInput, emailInput].forEach(field => {
      if (field) {
        field.style.borderColor = '#ffdecd';
        field.style.boxShadow = 'none';
      }
    });
    if (consentInput) {
      consentInput.style.outline = 'none';
    }
  }
  
  function showErrors(errors) {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    
    errors.forEach(error => {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.cssText = `
        color: #ff4757;
        font-size: 0.9rem;
        margin-top: 0.3rem;
        padding: 0.3rem 0.5rem;
        background: rgba(255, 71, 87, 0.1);
        border-radius: 4px;
      `;
      errorElement.textContent = error;
      
      if (error.includes('Имя')) {
        nameInput.parentElement.appendChild(errorElement);
      } else if (error.includes('телефон') || error.includes('номер')) {
        phoneInput.parentElement.appendChild(errorElement);
      } else if (error.includes('email')) {
        emailInput.parentElement.appendChild(errorElement);
      } else if (error.includes('согласие')) {
        consentInput.closest('.form-checkbox').appendChild(errorElement);
      }
    });
    
    const firstError = document.querySelector('.error-message');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  function openModal(formData) {
    modalName.textContent = formData.name;
    modalPhone.textContent = formData.phone;
    modalEmail.textContent = formData.email;
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => modalCloseBtn.focus(), 100);
  }
  
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    setTimeout(() => feedbackForm.querySelector('.form-button').focus(), 100);
  }
  
  feedbackForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    resetFieldHighlights();
    
    const formData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      consent: consentInput.checked
    };
    
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    
    openModal(formData);
    this.reset();
    wasPlusSevenAdded = false;
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    
    console.log('Форма отправлена:', formData);
  });
  
  modalCloseBtn.addEventListener('click', closeModal);
  modalCloseBtn2.addEventListener('click', closeModal);
  modal.querySelector('.modal__overlay').addEventListener('click', closeModal);
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
  
  modal.querySelector('.modal__content').addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  [nameInput, phoneInput, emailInput].forEach(field => {
    field.addEventListener('input', function() {
      highlightField(this, false);
      const error = this.parentElement.querySelector('.error-message');
      if (error) error.remove();
    });
  });
  
  consentInput.addEventListener('change', function() {
    highlightField(this, false);
    const checkboxContainer = this.closest('.form-checkbox');
    const error = checkboxContainer.querySelector('.error-message');
    if (error) error.remove();
  });
});