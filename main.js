import 'normalize.css';
import './style.scss';
import Swiper from 'swiper';
import {Navigation, Thumbs} from 'swiper/modules'
import 'swiper/css';

const swiperThumbnails = new Swiper(".product__slider-thumbnails", {
  spaceBetween: 10,
  slidesPerView: 4,
  freeMode: true,
  watchSlidesProgress: true,
});
new Swiper(".product__slider-main", {
  spaceBetween: 10,
  navigation: {
    nextEl: ".product__arrow_next",
    prevEl: ".product__arrow_prev",
  },
  modules: [Navigation, Thumbs],
  thumbs: {
    swiper: swiperThumbnails,
  },
});