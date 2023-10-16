import {Header} from '../../modules/Header/Header';
import {ApiService} from '../../services/ApiService';

export class CardButton {
  constructor(className, text) {
    this.className = className;
    this.text = text;
  }
  create(id) {
    const button = document.createElement('button');
    button.classList.add(this.className);
    button.dataset.id = id;
    button.textContent = this.text;

    button.addEventListener('click', async () => {
      const {totalCount} = await new ApiService().postProductToCart(id);
      console.log('count: ', totalCount);
      new Header().changeCount(totalCount);
    });

    return button;
  }
}
