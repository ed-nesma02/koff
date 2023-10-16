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
import {BreadCrumbs} from './features/BreadCrumbs/BreadCrumbs';
import {ProductCard} from './modules/ProductCard/ProductCard';
import {productSlider} from './features/ProductSlider/productSlider';
import { Cart } from './modules/Cart/Cart';

export const router = new Navigo('/', {linksSelector: "a[href^='/']"});

const init = () => {
  const api = new ApiService();
  new Header().mount();
  new Header().changeCount();
  new Main().mount();
  new Footer().mount();

  productSlider();

  router
    .on(
      '/',
      async () => {
        new Catalog().mount(new Main().element);
        const product = await api.getProducts();
        new ProductList().mount(new Main().element, product);
        router.updatePageLinks();
      },
      {
        leave(done) {
          new Catalog().unmount();
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
      async ({params: {slug, page = 1}}) => {
        (await new Catalog().mount(new Main().element)).setActiveLink(slug);
        const product = await api.getProducts({
          page: page,
          category: slug,
        });
        new BreadCrumbs().mount(new Main().element, [{text: slug}]);
        new ProductList().mount(
          new Main().element,
          product.data,
          slug,
          'Товар отсутствует'
        );
        if (product.pagination.totalPages > 1) {
          new Pagination()
            .mount(new ProductList().containerElement)
            .update(product.pagination);
        }

        router.updatePageLinks();
      },
      {
        leave(done) {
          new Catalog().setActiveLink().unmount();
          new BreadCrumbs().unmount();
          new ProductList().unmount();
          done();
        },
      }
    )
    .on(
      '/favorite',
      async ({params}) => {
        new Catalog().mount(new Main().element);
        const list = new FavoriteService().get();
        const product = await api.getProducts({page: params?.page || 1, list});
        new BreadCrumbs().mount(new Main().element, [{text: 'Избранное'}]);
        new ProductList().mount(
          new Main().element,
          product.data,
          'Избранное',
          'В избранном ничего нет'
        );
        if (product.pagination?.totalPages > 1) {
          new Pagination()
            .mount(new ProductList().containerElement)
            .update(product.pagination);
        }

        router.updatePageLinks();
      },
      {
        leave(done) {
          new BreadCrumbs().unmount();
          new Catalog().unmount();
          new ProductList().unmount();
          done();
        },
        already(match) {
          match.route.handler(match);
        },
      }
    )
    .on('/search', async ({params: {search, page}}) => {
      new Catalog().mount(new Main().element);
      const product = await api.getProducts({page: page || 1, search});
      new BreadCrumbs().mount(new Main().element, [{text: `Поиск`}]);
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
    },{
      leave(done) {
        new BreadCrumbs().unmount();
        new Catalog().unmount();
        new ProductList().unmount();
        done();
      }
    }
    )
    .on(
      '/product/:id',
      async ({data: {id}}) => {
        new Catalog().mount(new Main().element);
        const data = await api.getProductById(id);
        new BreadCrumbs().mount(new Main().element, [
          {
            text: data.category,
            href: `/category?slug=${data.category}`,
          },
          {
            text: data.name,
          },
        ]);
        new ProductCard().mount(new Main().element, data);
        productSlider();
      },
      {
        leave(done) {
          new Catalog().unmount();
          new BreadCrumbs().unmount();
          new ProductCard().unmount();
          done();
        },
      }
    )
    .on('/cart', async () => {
      const cartItems = await api.getCart();
      new Cart().mount(new Main().element, cartItems, 'Корзина пуста');
    }, {
      leave(done) {
        new Cart().unmount();
        new Header().changeCount();
        done();
      }
    })
    .on(
      '/order/:id',
      async ({data: {id}}) => {
        const order = await api.getOrder(id);
        console.log(order[0]);
        new Order().mount(new Main().element, order[0]);
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
