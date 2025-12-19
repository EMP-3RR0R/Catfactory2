document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.reviews-container');
  const cards = document.querySelectorAll('.review-card');
  const prevBtn = document.querySelector('.arrow-left');
  const nextBtn = document.querySelector('.arrow-right');
  
  const totalCards = cards.length;
  let cardsPerView = 3;
  let currentStartIndex = 0;
  
  function updateCardsPerView() {
    const width = window.innerWidth;
    
    if (width <= 600) {
      cardsPerView = 1;
    } else if (width <= 900) {
      cardsPerView = 2;
    } else {
      cardsPerView = 3;
    }
    
    cards.forEach(card => {
      if (cardsPerView === 1) {
        card.style.flex = '0 0 100%';
        card.style.minWidth = '100%';
      } else if (cardsPerView === 2) {
        card.style.flex = '0 0 calc(50% - 1rem)';
        card.style.minWidth = 'calc(50% - 1rem)';
      } else {
        card.style.flex = '0 0 calc(33.333% - 1.33rem)';
        card.style.minWidth = 'calc(33.333% - 1.33rem)';
      }
    });
    
    showCurrentCards();
  }
  
  function reorderCards(startIndex) {
    cards.forEach(card => {
      card.classList.remove('active');
      card.style.order = '';
    });
    
    for (let i = 0; i < totalCards; i++) {
      const cardIndex = (startIndex + i) % totalCards;
      cards[cardIndex].style.order = i;
      
      if (i < cardsPerView) {
        cards[cardIndex].classList.add('active');
      }
    }
  }
  
  function showCurrentCards() {
    reorderCards(currentStartIndex);
  }
  
  function goToNext() {
    currentStartIndex = (currentStartIndex + 1) % totalCards;
    showCurrentCards();
  }
  
  function goToPrev() {
    currentStartIndex = (currentStartIndex - 1 + totalCards) % totalCards;
    showCurrentCards();
  }
  
  function initSlider() {
    showCurrentCards();
    
    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      
      if (touchEndX < touchStartX - swipeThreshold) {
        goToNext();
      }
      
      if (touchEndX > touchStartX + swipeThreshold) {
        goToPrev();
      }
    }
    
    window.addEventListener('resize', updateCardsPerView);
    
    updateCardsPerView();
  }
  
  initSlider();
});