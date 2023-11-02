// 40376634-425603d0c2c6ec0a3588c1f3a
import axios from 'axios';
import Notiflix from 'notiflix';
import throttle from 'lodash.throttle';

import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');

const backToTop = document.querySelector('.back-to-top');
backToTop.hidden = true;

const countPage = 40;
let page = 1;
let maxPages = page;
let messEndSearchResult = false;

const optionsGallery = {
  sourceAttr: 'href',
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  disableScroll: false,
  scrollZoom: false,
  doubleTapZoom: false,
};

const lightbox = new simpleLightbox('.gallery a', optionsGallery);

form.addEventListener('submit', event => {
  event.preventDefault();

  removeChildren(gallery);

  page = 1;
  messEndSearchResult = false;

  if (searchInput.value.trim().length === 0) {
    Notiflix.Notify.failure('The search field must be filled!');
    return;
  }

  getImages()
    .then(responce => render(responce.data))
    .catch(error => getError(error));
});

const render = items => {
  maxPages = Math.ceil(items.totalHits / countPage);

  if (items.hits.length === 0) {
    return getError(error);
  }

  Notiflix.Notify.success(`Hooray! We found ${items.totalHits} images.`);

  if (items.totalHits > 0) {
    const markup = items.hits
      .map(item => {
        return `<a class="photo-card" href="${item.largeImageURL}">
                <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
                <div class="info">
                <p class="info-item">
                <b>Likes</b>
                ${item.likes}
                </p>
                <p class="info-item">
                <b>Views</b>
                ${item.views}
                </p>
                <p class="info-item">
                <b>Comments</b>
                ${item.comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>
                ${item.downloads}
                </p>
                </div>
                </a>`;
      })
      .join('');

    gallery.insertAdjacentHTML('beforeend', markup);

    lightbox.refresh();
  }
};

const removeChildren = container => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

const getError = error => {
  error = Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

const scrollingUpdating = () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollPosition = window.scrollY;

  if (documentHeight - (windowHeight + scrollPosition) <= 100) {
    if (maxPages > page) {
      page += 1;

      getImages()
        .then(responce => render(responce.data))
        .catch(error => getError(error));
    } else {
      if (!messEndSearchResult) {
        messEndSearchResult = true;

        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  }

  if (
    document.documentElement.clientHeight < document.documentElement.scrollTop
  ) {
    backToTop.hidden = false;
  } else {
    backToTop.hidden = true;
  }
};

const throttledScrolling = throttle(() => {
  scrollingUpdating();
}, 1000);

document.addEventListener('scroll', () => {
  throttledScrolling();
});

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

/////////////////////////////////////////////////////
const getImages = async () => {
  const paramsObject = {
    key: '40376634-425603d0c2c6ec0a3588c1f3a',
    q: searchInput.value.trim(),
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: countPage,
    page: page,
  };

  const params = new URLSearchParams(paramsObject);

  return await axios.get(`https://pixabay.com/api/?${params}`);
};
