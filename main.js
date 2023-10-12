import 'normalize.css';
import './style.scss';
import Navigo from 'navigo';
import {Header} from './modules/Header/Header';
import {Main} from './modules/Main/Main';
import {Footer} from './modules/Footer/Footer';
import {Order} from './modules/Main/Order/Order';
import {ProductList} from './modules/ProductList/ProductList';
import {ApiService} from './services/ApiService';
import {Catalog} from './modules/Catalog/Catalog';
import {NotFound} from './modules/NotFound/NotFound';
import {FavoriteService} from './services/StorageService';
import {Pagination} from './features/Pagination/Pagination';

const productSlider = () => {
  Promise.all([
    import('swiper/modules'),
    import('swiper'),
    import('swiper/css'),
  ]).then(([{Navigation, Thumbs}, Swiper]) => {
    const swiperThumbnails = new Swiper.default('.product__slider-thumbnails', {
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });
    new Swiper.default('.product__slider-main', {
      spaceBetween: 10,
      navigation: {
        nextEl: '.product__arrow_next',
        prevEl: '.product__arrow_prev',
      },
      modules: [Navigation, Thumbs],
      thumbs: {
        swiper: swiperThumbnails,
      },
    });
  });
};

const init = () => {
  const api = new ApiService();
  const router = new Navigo('/', {linksSelector: "a[href^='/']"});
  new Header().mount(router);
  new Main().mount();
  new Footer().mount();

  api.getProductCategories().then((data) => {
    new Catalog().mount(new Main().element, data);
    router.updatePageLinks();
  });

  productSlider();

  router
    .on(
      '/',
      async () => {
        const product = await api.getProducts();
        new ProductList().mount(new Main().element, product);
        router.updatePageLinks();
      },
      {
        leave(done) {
          new ProductList().unmount();
          done();
        },
        already(match) {
          match.route.handler(match);
        },
      }
    )
    .on(
      '/category',
      async ({params: {slug, page}}) => {
        const product = await api.getProducts({
          page: page || 1,
          category: slug,
        });
        new ProductList().mount(new Main().element, product.data, slug, 'Товар отсутствует');
        if (product.pagination.totalPages > 1) {
          new Pagination()
            .mount(new ProductList().containerElement)
            .update(product.pagination);
        }

        router.updatePageLinks();
      },
      {
        leave(done) {
          new ProductList().unmount();
          done();
        },
      }
    )
    .on(
      '/favorite',
      async ({params: {page}}) => {
        const list = new FavoriteService().get();
        const product = await api.getProducts({page, list});
        new ProductList().mount(new Main().element, product.data, 'Избранное', 'В избранном ничего нет');
        if (product.pagination.totalPages > 1) {
          new Pagination()
            .mount(new ProductList().containerElement)
            .update(product.pagination);
        }

        router.updatePageLinks();
      },
      {
        leave(done) {
          new ProductList().unmount();
          done();
        },
        already(match) {
          match.route.handler(match);
        },
      }
    )
    .on('/search', async ({params: {search, page}}) => {
      const product = await api.getProducts({page: page || 1, search});
      new ProductList().mount(
        new Main().element,
        product.data,
        `Результаты по запросу: ${search}`,
        'Ничего не найдено'
      );
      if (product.pagination.totalPages > 1) {
        new Pagination()
          .mount(new ProductList().containerElement)
          .update(product.pagination);
      }

      router.updatePageLinks();
    })
    .on('/product/:id', ({data: {id}}) => {
      console.log('product');
    })
    .on('/cart', () => {
      console.log('cart');
    })
    .on(
      '/order',
      () => {
        new Order().mount(new Main().element);
        router.updatePageLinks();
      },
      {
        leave(done) {
          new Order().unmount();
          done();
        },
      }
    )
    .notFound(
      () => {
        new NotFound().mount(new Main().element);

        setTimeout(() => {
          router.navigate('/');
        }, 5000);
      },
      {
        leave(done) {
          new NotFound().unmount();
          done();
        },
      }
    );
  router.resolve();
};

init();
