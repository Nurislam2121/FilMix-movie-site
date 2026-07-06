const heroBlockContainer = document.querySelector(".heroBlock__container");
const heroBlockTitle = document.querySelector(".heroBlock__title");
const heroBlockDesc = document.querySelector(".heroBlock__desc");
const heroBlockbtn = document.querySelector(".heroBlock__button");

const heroBlockList = [
  {
    img: "/media/heroBlock1.jpg",
    title: "Открой мир кино",
    desc: "Погрузись в огромную коллекцию фильмов — от классики до новинок. Исследуй тысячи тайтлов и находи кино под любое настроение.",
  },
  {
    img: "/media/heroBlock2.jpg",
    title: "Смотри фильмы по жанрам",
    desc: "Используй удобную фильтрацию, чтобы быстро находить лучшие фильмы. Выбирай жанры, сортируй по рейтингу, просмотрам или году выпуска — всё работает мгновенно.",
  },
  {
    img: "/media/heroBlock3.jpg",
    title: "Лучший каталог фильмов",
    desc: "Наш сервис создан для того, чтобы поиск фильма был простым и приятным. Интерактивный поиск в реальном времени поможет находить нужное за секунды.",
  },
];

let heroBlockIndex = 0;
heroBlockContainer.style.backgroundImage = `url('${heroBlockList[heroBlockIndex].img}')`;
heroBlockTitle.textContent = heroBlockList[heroBlockIndex].title;
heroBlockDesc.textContent = heroBlockList[heroBlockIndex].desc;

setInterval(() => {
  heroBlockIndex = (heroBlockIndex + 1) % heroBlockList.length;

  heroBlockContainer.style.backgroundImage = `url('${heroBlockList[heroBlockIndex].img}')`;
  heroBlockTitle.textContent = heroBlockList[heroBlockIndex].title;
  heroBlockDesc.textContent = heroBlockList[heroBlockIndex].desc;

  heroBlockContainer.classList.remove("heroBlock--animate");
  void heroBlockContainer.offsetWidth;
  heroBlockContainer.classList.add("heroBlock--animate");
}, 10000);

const infoBannerList = [
  {
    img: "/media/filter-vec.svg",
    desc: "Мы сделали фильтры максимально простыми и понятными. Выбирай жанры, год, рейтинг или сочетай несколько параметров — система мгновенно подберёт подходящие фильмы.",
  },
  {
    img: "/media/search-vec.svg",
    desc: "Поиск работает в реальном времени. Просто начни вводить название — и результаты появятся моментально, без перезагрузки страницы.",
  },
  {
    img: "/media/movie-vec.svg",
    desc: "У нас собраны фильмы разных жанров и годов — от популярных новинок до редких классических тайтлов. Всё в одном месте.",
  },
  {
    img: "/media/interface-vec.svg",
    desc: "Каждая карточка содержит всё важное: постер, описание, рейтинг, даты выхода, жанры и кнопку “Подробнее”. Ничего лишнего — только удобство.",
  },
];

const infoBannerContainer = document.querySelector(".info-banner__container");

infoBannerList.forEach((element) => {
  const card = document.createElement("div");
  card.classList.add("info-banner__card");

  card.innerHTML = `<img src="${element.img}" alt="" class="info-banner__image">
                    <p class="info-banner__desc">${element.desc}</p>`;

  infoBannerContainer.appendChild(card);
});

