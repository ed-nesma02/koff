import {API_URL} from '../../const';
import {CardButton} from '../CartButton/CardButton';
import {LikeButton} from '../LikeButton/LikeButton';

export class Card {
  constructor({id, title, price, image}) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.image = image;
    this.cartButton = new CardButton('card__btn', 'В корзину');
    this.favoriteButton = new LikeButton('card__favorite');
  }

  create() {
    const article = document.createElement('article');
    article.classList.add('goods__card', 'card');

    const link = document.createElement('a');
    link.classList.add('card__link', 'card__link_img');
    link.href = `/product/${this.id}`;

    const img = document.createElement('img');
    img.classList.add('card__img');
    img.src = `${API_URL}${this.image}`;
    img.alt = this.title;
    link.append(img);

    const info = document.createElement('div');
    info.classList.add('card__info');

    const title = document.createElement('h3');
    title.classList.add('card__title');

    const linkTitle = document.createElement('a');
    linkTitle.classList.add('card__link');
    linkTitle.href = `/product/${this.id}`;
    linkTitle.textContent = this.title;
    title.append(linkTitle);

    const price = document.createElement('p');
    price.classList.add('card__price');
    price.innerHTML = `${this.price.toLocaleString()}&nbsp;₽`;
    info.append(title, price);

    const btnCart = this.cartButton.create(this.id);
    const btnFavorite = this.favoriteButton.create(this.id);
    article.append(link, info, btnCart, btnFavorite);

    return article;
  }
}

//       <button class="card__favorite" data-id="${id}">
//         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
//           <path d="M8.41331 13.8733C8.18665 13.9533 7.81331 13.9533 7.58665 13.8733C5.65331 13.2133 1.33331 10.46 1.33331 5.79332C1.33331 3.73332 2.99331 2.06665 5.03998 2.06665C6.25331 2.06665 7.32665 2.65332 7.99998 3.55998C8.67331 2.65332 9.75331 2.06665 10.96 2.06665C13.0066 2.06665 14.6666 3.73332 14.6666 5.79332C14.6666 10.46 10.3466 13.2133 8.41331 13.8733Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
//         </svg>
//       </button>
