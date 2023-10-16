import {API_URL} from '../../const';
import {debounce} from '../../helpers';
import {router} from '../../main';
import {ApiService} from '../../services/ApiService';
import {Header} from '../Header/Header';
import {addContainer} from '../addContainer';

export class Cart {
  static instance = null;

  constructor() {
    if (!Cart.instance) {
      Cart.instance = this;
      this.element = document.createElement('section');
      this.element.classList.add('cart');
      this.containerElement = addContainer(this.element, 'cart__container');
      this.isMounted = false;
      this.debUpdateCart = debounce(this.updateCart.bind(this), 300);
    }

    return Cart.instance;
  }

  mount(parent, data, emptyText) {
    if (this.isMounted) {
      return;
    }
    this.containerElement.textContent = '';
    const title = document.createElement('h2');
    title.classList.add('cart__title');
    title.textContent = 'Корзина';

    this.containerElement.append(title);

    this.cartData = data;

    if (data.products && data.products.length) {
      this.renderProducts();
      this.renderPlace();
      this.renderForm();
    } else {
      this.containerElement.insertAdjacentHTML(
        'beforeend',
        `<p class='goods__empty'>
          ${emptyText || 'Произошла ошибка попробуйте снова'}
        </p>`
      );
    }

    parent.append(this.element);
    this.isMounted = true;
  }

  unmount() {
    this.element.remove();
    this.isMounted = false;
  }

  updateCart(id, quantity) {
    if (quantity === 0) {
      new ApiService().deleteProductFromCart(id);
      this.cartData.products = this.cartData.products.filter(
        (item) => item.id !== id
      );
    } else {
      new ApiService().updateQuantityProductToCart(id, quantity);
      this.cartData.products.forEach((item) => {
        if (item.id === id) {
          item.quantity = quantity;
        }
      });
    }

    this.cartData.totalPrice = this.cartData.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    new Header().changeCount(this.cartData.products.length);
    this.cartPlaceCount.textContent = `${this.cartData.products.length} товара на сумму:`;
    this.cartPlacePrice.innerHTML = `${this.cartData.totalPrice.toLocaleString()}&nbsp;₽`;
  }

  renderProducts() {
    const listProducts = this.cartData.products;
    const listElem = document.createElement('ul');
    listElem.classList.add('cart__products');

    const listItems = listProducts.map((item) => {
      const listItemElem = document.createElement('li');
      listItemElem.classList.add('cart__product');
      const img = document.createElement('img');
      img.classList.add('cart__img');
      img.src = `${API_URL}${item.images[0]}`;
      img.alt = item.name;

      const title = document.createElement('h3');
      title.classList.add('cart__title-product');
      title.textContent = item.name;

      const price = document.createElement('p');
      price.classList.add('cart__price');
      price.innerHTML = `${(
        item.quantity * item.price
      ).toLocaleString()}&nbsp;₽`;

      const article = document.createElement('p');
      article.classList.add('cart__article');
      article.innerHTML = `${item.article}`;

      const productControl = document.createElement('div');
      productControl.classList.add('cart__product-control');

      const cartProductBtnMinus = document.createElement('button');
      cartProductBtnMinus.classList.add('cart__product-btn');
      cartProductBtnMinus.textContent = '-';

      const cartProductCount = document.createElement('p');
      cartProductCount.classList.add('cart__product-count');
      cartProductCount.textContent = item.quantity;

      const cartProductBtnPlus = document.createElement('button');
      cartProductBtnPlus.classList.add('cart__product-btn');
      cartProductBtnPlus.textContent = '+';

      productControl.append(
        cartProductBtnMinus,
        cartProductCount,
        cartProductBtnPlus
      );
      cartProductBtnMinus.addEventListener('click', async () => {
        if (item.quantity) {
          item.quantity--;
          cartProductCount.textContent = item.quantity;

          if (item.quantity === 0) {
            listItemElem.remove();
            this.debUpdateCart(item.id, item.quantity);
            return;
          }
          price.innerHTML = `${(
            item.quantity * item.price
          ).toLocaleString()}&nbsp;₽`;

          this.debUpdateCart(item.id, item.quantity);
        }
      });

      cartProductBtnPlus.addEventListener('click', () => {
        item.quantity++;
        cartProductCount.textContent = item.quantity;
        price.innerHTML = `${(
          item.quantity * item.price
        ).toLocaleString()}&nbsp;₽`;
        this.debUpdateCart(item.id, item.quantity);
      });

      listItemElem.append(img, title, price, article, productControl);
      return listItemElem;
    });

    listElem.append(...listItems);
    this.containerElement.append(listElem);
  }
  renderPlace() {
    const count = this.cartData.totalCount;
    const totalPrice = this.cartData.totalPrice;

    const cartPlace = document.createElement('div');
    cartPlace.classList.add('cart__place');

    const title = document.createElement('h3');
    title.classList.add('cart__subtitle');
    title.textContent = 'Оформление';

    const cartPlaceInfo = document.createElement('div');
    cartPlaceInfo.classList.add('cart__place-info');

    this.cartPlaceCount = document.createElement('p');
    this.cartPlaceCount.classList.add('cart__place-count');
    this.cartPlaceCount.textContent = `${count} товара на сумму:`;

    this.cartPlacePrice = document.createElement('p');
    this.cartPlacePrice.classList.add('cart__place-price');
    this.cartPlacePrice.innerHTML = `${totalPrice.toLocaleString()}&nbsp;₽`;

    cartPlaceInfo.append(this.cartPlaceCount, this.cartPlacePrice);

    const cartPlaceDelivery = document.createElement('p');
    cartPlaceDelivery.classList.add('cart__place-delivery');
    cartPlaceDelivery.textContent = `Доставка 0 ₽`;

    const cartPlaceBtn = document.createElement('button');
    cartPlaceBtn.classList.add('cart__place-btn');
    cartPlaceBtn.textContent = 'Оформить заказ';
    cartPlaceBtn.type = 'submit';
    cartPlaceBtn.setAttribute('form', 'order');

    cartPlace.append(title, cartPlaceInfo, cartPlaceDelivery, cartPlaceBtn);

    this.containerElement.append(cartPlace);
  }
  renderForm() {
    const form = document.createElement('form');
    form.classList.add('cart__form', 'form-order');
    form.id = 'order';
    form.method = 'POST';

    const title = document.createElement('h3');
    title.classList.add('cart__subtitle', 'cart__subtitle_form-order');
    title.textContent = 'Данные для доставки';

    const inputFieldset = document.createElement('fieldset');
    inputFieldset.classList.add(
      'form-order__fieldset',
      'form-order__fieldset_input'
    );

    const name = document.createElement('input');
    name.classList.add('form-order__input');
    name.type = 'text';
    name.name = 'name';
    name.required = true;
    name.placeholder = 'Фамилия Имя Отчество';

    const phone = document.createElement('input');
    phone.classList.add('form-order__input');
    phone.type = 'tel';
    phone.name = 'phone';
    phone.required = true;
    phone.placeholder = 'Телефон';

    const email = document.createElement('input');
    email.classList.add('form-order__input');
    email.type = 'email';
    email.name = 'email';
    email.required = true;
    email.placeholder = 'E-mail';

    const address = document.createElement('input');
    address.classList.add('form-order__input');
    address.type = 'text';
    address.name = 'address';
    address.required = true;
    address.placeholder = 'Адрес доставки';

    const textArea = document.createElement('textarea');
    textArea.classList.add('form-order__textarea');
    textArea.name = 'comments';
    textArea.placeholder = 'Комментарий к заказу';

    inputFieldset.append(name, phone, email, address, textArea);

    const radioDeliveryFieldset = document.createElement('fieldset');
    radioDeliveryFieldset.classList.add(
      'form-order__fieldset',
      'form-order__fieldset_radio'
    );

    const deliveryLegend = document.createElement('legend');
    deliveryLegend.classList.add('form-order__legend');
    deliveryLegend.textContent = 'Доставка';

    const deliveryLabel = document.createElement('label');
    deliveryLabel.classList.add('form-order__label', 'radio');
    const deliveryLabelText = document.createTextNode('Доставка');

    const deliveryInput = document.createElement('input');
    deliveryInput.classList.add('radio__input');
    deliveryInput.type = 'radio';
    deliveryInput.name = 'deliveryType';
    deliveryInput.value = 'delivery';
    deliveryInput.required = true;
    deliveryInput.checked = true;
    deliveryLabel.append(deliveryInput, deliveryLabelText);

    const pickupLabel = document.createElement('label');
    pickupLabel.classList.add('form-order__label', 'radio');
    const pickupLabelText = document.createTextNode('Самовывоз');

    const pickupInput = document.createElement('input');
    pickupInput.classList.add('radio__input');
    pickupInput.type = 'radio';
    pickupInput.name = 'deliveryType';
    pickupInput.value = 'pickup';
    pickupInput.required = true;
    pickupLabel.append(pickupInput, pickupLabelText);

    radioDeliveryFieldset.append(deliveryLegend, deliveryLabel, pickupLabel);

    radioDeliveryFieldset.addEventListener('change', (e) => {
      if (e.target === deliveryInput) {
        address.disabled = false;
      } else {
        address.disabled = true;
        address.value = '';
      }
    });

    const radioPaymentFieldset = document.createElement('fieldset');
    radioPaymentFieldset.classList.add(
      'form-order__fieldset',
      'form-order__fieldset_radio'
    );

    const paymentLegend = document.createElement('legend');
    paymentLegend.classList.add('form-order__legend');
    paymentLegend.textContent = 'Оплата';

    const cardLabel = document.createElement('label');
    cardLabel.classList.add('form-order__label', 'radio');
    const cardLabelText = document.createTextNode('Картой при получении');

    const cardInput = document.createElement('input');
    cardInput.classList.add('radio__input');
    cardInput.type = 'radio';
    cardInput.name = 'paymentType';
    cardInput.value = 'card';
    cardInput.required = true;
    cardInput.checked = true;
    cardLabel.append(cardInput, cardLabelText);

    const cashLabel = document.createElement('label');
    cashLabel.classList.add('form-order__label', 'radio');
    const cashLabelText = document.createTextNode('Наличными при получении');

    const cashInput = document.createElement('input');
    cashInput.classList.add('radio__input');
    cashInput.type = 'radio';
    cashInput.name = 'paymentType';
    cashInput.value = 'cash';
    cashInput.required = true;
    cashLabel.append(cashInput, cashLabelText);

    radioPaymentFieldset.append(paymentLegend, cardLabel, cashLabel);

    form.append(
      title,
      inputFieldset,
      radioDeliveryFieldset,
      radioPaymentFieldset
    );

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form));
      console.log('data: ', data);

      const {orderId} = await new ApiService().postOrder(data);
      router.navigate(`/order/${orderId}`);
    });

    this.containerElement.append(form);
  }
}
