import axios from "axios";
import Notiflix from "notiflix";
import { Notify } from "notiflix/build/notiflix-notify-aio.js";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = "https://pixabay.com/api/";
const API_KEY = "42872675-364989bcac8f0c57b2db4a522";

const options = {
    params: {
        key: API_KEY,
        q: '',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: 1,
        per_page: 40,
    }
};

const gallerypage = document.querySelector("pagination");
const galleryEl = document.querySelector(".gallery");
const searchInputEl = document.querySelector('input[name="searchQuery"]');
const searchFormEl = document.getElementById("search-form");
const lightbox = new SimpleLightbox('.lightbox', {
    captionsData: 'alt',
    captionDelay:250,
});
let currentPage = 1;
let totalHits = 0;
let reachedEnd = false;
console.log(options.params.per_page);
console.log(currentPage);
function generatePhotoCard({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) {
    return `<a href="${largeImageURL}" class="lightbox">
                <div class="photo-card">
                    <image src="${webformatURL}" alt="${tags}" loading="lazy"></image>
                    <div class="info">
                        <p class="info-item"><b>Likes</b>${likes}</p>
                        <p class="info-item"><b>Views</b>${views}</p>
                        <p class="info-item"><b>Comments</b>${comments}</p>
                        <p class="info-item"><b>Downloads</b>${downloads}</p>
                    </div>
                </div>
            </a>`;
}

function renderGallery(hits, totalHits) {
    const markup = hits.map(generatePhotoCard).join('');
    galleryEl.insertAdjacentHTML('beforeend', markup);
    if (options.params.page * options.params.per_page >= totalHits && !reachedEnd) {
        Notify.info("Sorry, you have reached the end of the results.");
        reachedEnd = true;
    }
    renderPagination(totalHits);
    lightbox.refresh();
}

function notifyUser(message, type = 'success') {
    if (type === 'success') {
        Notify.success(message);
    } else {
        Notify.failure(message);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    options.params.q = searchInputEl.value.trim();
    if (options.params.q === '') return;

    options.params.page = 1;
    galleryEl.innerHTML = '';
    reachedEnd = false;

    try {
        const res = await axios.get(BASE_URL, options);
        const { hits, totalHits } = res.data;
        if (hits.length === 0) {
            notifyUser(`Sorry, there are no images matching your search. Please try again.`, 'failure');
        } else {
            notifyUser(`Hooray! We found ${totalHits} images.`);
            console.log(totalHits);
            renderGallery(hits, totalHits);
        }
        searchInputEl.value = '';
    } catch (err) {
        notifyUser(`${err}`, 'failure');
    }
}

async function loadMore() {
    options.params.page += 1;
    try {
        const res = await axios.get(BASE_URL, options);
        const hits = res.data.hits;
        renderGallery(hits);
    } catch (err) {
        notifyUser(`${err}`, 'failure');
    }
}

// function handleScroll() {
//     const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
//     if (scrollTop + clientHeight >= scrollHeight) {
//         loadMore();
//     }
// }

function renderPagination(totalHits) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    console.log(totalHits);
    const totalPages = Math.ceil(totalHits / options.params.per_page);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadMore();
        });
        pagination.appendChild(pageButton);
    }
}

searchFormEl.addEventListener('submit', handleSubmit);
window.addEventListener('scroll', handleScroll);
