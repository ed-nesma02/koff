import { router } from '../../../main';
import {addContainer} from '../../addContainer';

export class Order {
  static instance = null;

  constructor() {
    if (!Order.instance) {
      Order.instance = this;
      this.element = document.createElement('section');
      this.element.classList.add('order');
      this.containerElement = addContainer(this.element, 'order__container');
      this.isMounted = false;
    }

    return Order.instance;
  }

  mount(parent, data) {
    if (this.isMounted) {
      return;
    }
    
    const header = this.getHeader(data);
    const info = this.getInfo(data);
    const link = this.getLink();

    this.containerElement.append(header, info, link);
    parent.append(this.element);
    this.isMounted = true;
  }

  unmount() {
    this.element.remove();
    this.isMounted = false;
  }

  getHeader(data) {
    const header = document.createElement('div');
    header.classList.add('order__header');
    header.innerHTML = `<h2 class="order__title">Заказ успешно размещен</h2>`;

    const price = document.createElement('p');
    price.classList.add('order__price');
    price.innerHTML = `${data?.totalPrice.toLocaleString()}&nbsp;₽`;

    const number = document.createElement('p');
    number.classList.add('order__number');
    number.innerHTML = `№&nbsp;${data?.id}`

    header.append(price, number);
    return header;
  }

  getInfo(data) {
    const info = document.createElement('div');
    info.classList.add('order__info');
    info.innerHTML = `<h3 class="order__info-title">Данные доставки</h3>`;

    const list = document.createElement('ul');
    list.classList.add('order__info-list', 'order-list');

    list.append(
      this.getInfoItem('Получатель', data?.name),
      this.getInfoItem('Телефон', data?.phone),
      this.getInfoItem('E-mail', data?.email),
      data?.address ? this.getInfoItem('Адрес доставки', data?.address) : '',
      this.getInfoItem('Способ оплаты', data?.paymentType === 'card' ? 'Картой при получении' : 'Наличными при получении'),
      this.getInfoItem('Способ получения', data?.deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка')
    );

    info.append(list);
    return info;
  }

  getInfoItem(field, value) {
    const item = document.createElement('li');
    item.classList.add('order-list__item');

    const fieldItem = document.createElement('p');
    fieldItem.classList.add('order-list__field');
    fieldItem.textContent = field;

    const valueItem = document.createElement('p');
    valueItem.classList.add('order-list__value');
    valueItem.textContent = value;

    item.append(fieldItem, valueItem);
    return item;
  }

  getLink() {
    const link = document.createElement('button');
    link.classList.add('order__link');
    link.textContent = 'На главную';

    link.addEventListener('click', e =>{
      e.preventDefault();
      router.navigate('/');
    })

    return link;
  }
}
