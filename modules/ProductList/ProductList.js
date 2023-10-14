import {Card} from '../../features/Card/Card';
import {addContainer} from '../addContainer';

export class ProductList {
  static instance = null;

  constructor() {
    if (!ProductList.instance) {
      ProductList.instance = this;
      this.element = document.createElement('section');
      this.element.classList.add('goods');
      this.containerElement = addContainer(this.element);
      this.isMounted = false;
    }

    return ProductList.instance;
  }

  mount(parent, data = [], title, emptyText) {
    this.containerElement.textContent = '';
    const titleElem = document.createElement('h2');
    titleElem.textContent = title ? title : 'Список товаров';

    titleElem.className = title
      ? 'goods__title'
      : 'goods__title visually-hidden';

    this.containerElement.append(titleElem);

    if(data.length){
      this.updateListElem(data);
    } else {
      this.containerElement.insertAdjacentHTML(
        'beforeend', 
        `<p class='goods__empty'>
          ${emptyText || 'Произошла ошибка попробуйте снова'}
        </p>`
      )
    }
    

    if (this.isMounted) {
      return;
    }
    parent.append(this.element);
    this.isMounted = true;
  }

  unmount() {
    this.element.remove();
    this.isMounted = false;
  }

  updateListElem(data = []) {
    const listElem = document.createElement('ul');
    listElem.classList.add('goods__list');

    const listItems = data.map(({id, name: title, price, images: [image]}) => {
      const listItemElement = document.createElement('li');
      listItemElement.append(new Card({id, title, price, image}).create());
      return listItemElement;
    });

    listElem.append(...listItems);
    this.containerElement.append(listElem);
  }
}
