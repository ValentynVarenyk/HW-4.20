
const API_KEY = '58313827-e4000e29ec86bdc48bb912b99';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let searchQuery = '';
const perPage = 12;
let totalHits = 0;

const fetchImages = async (query, pageNumber) => {
  try {
    const params = new URLSearchParams({
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      page: pageNumber,
      per_page: perPage,
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error('Помилка HTTP-запиту');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Помилка отримання зображень:', error);
    throw error;
  }
};

const createMarkup = async (images) => {
  try {
    let markup = '';

    for (const image of images) {
      markup += `
        <li class="gallery-item">
          <div class="photo-card">
            <img
              src="${image.webformatURL}"
              alt="${image.tags}"
              loading="lazy"
            />

            <div class="stats">
              <p class="stats-item">
                <i class="material-icons">thumb_up</i>
                ${image.likes}
              </p>

              <p class="stats-item">
                <i class="material-icons">visibility</i>
                ${image.views}
              </p>

              <p class="stats-item">
                <i class="material-icons">comment</i>
                ${image.comments}
              </p>

              <p class="stats-item">
                <i class="material-icons">cloud_download</i>
                ${image.downloads}
              </p>
            </div>
          </div>
        </li>
      `;
    }

    return markup;
  } catch (error) {
    console.error('Помилка створення розмітки:', error);
    throw error;
  }
};

const renderImages = async (images) => {
  try {
    const markup = await createMarkup(images);

    gallery.insertAdjacentHTML('beforeend', markup);
  } catch (error) {
    console.error('Помилка відображення:', error);
    throw error;
  }
};

const checkLoadMore = async () => {
  try {
    if (page * perPage >= totalHits) {
      loadMoreBtn.hidden = true;
    } else {
      loadMoreBtn.hidden = false;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSearch = async (event) => {
  event.preventDefault();

  try {
    const query = form.elements.query.value.trim();

    if (!query) {
      alert('Введіть пошукове слово!');
      return;
    }

    searchQuery = query;
    page = 1;

    gallery.innerHTML = '';
    loadMoreBtn.hidden = true;

    const data = await fetchImages(searchQuery, page);

    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      alert('За вашим запитом нічого не знайдено!');
      return;
    }

    await renderImages(data.hits);
    await checkLoadMore();

  } catch (error) {
    alert('Не вдалося завантажити зображення!');
    console.error(error);
  }
};

const handleLoadMore = async () => {
  try {
    loadMoreBtn.disabled = true;

    const previousCount = gallery.children.length;

    page += 1;

    const data = await fetchImages(searchQuery, page);

    await renderImages(data.hits);
    await checkLoadMore();

    const newImage = gallery.children[previousCount];

    if (newImage) {
      newImage.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

  } catch (error) {
    page -= 1;
    alert('Не вдалося завантажити наступні зображення!');
    console.error(error);
  } finally {
    loadMoreBtn.disabled = false;
  }
};

form.addEventListener('submit', async (event) => {
  try {
    await handleSearch(event);
  } catch (error) {
    console.error(error);
  }
});

loadMoreBtn.addEventListener('click', async () => {
  try {
    await handleLoadMore();
  } catch (error) {
    console.error(error);
  }
});
