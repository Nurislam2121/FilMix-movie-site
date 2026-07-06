
const text = document.getElementById('text');
const btn = document.getElementById('toggleBtn');

btn.addEventListener('click', () => {
    text.classList.toggle('expanded');
    btn.textContent = text.classList.contains('expanded') ? 'Свернуть' : 'Показать больше';
  });