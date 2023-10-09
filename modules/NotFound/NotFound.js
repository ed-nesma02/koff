import { addContainer } from "../addContainer";

export class NotFound {
  static instance = null;

  constructor() {
    if (!NotFound.instance) {
      NotFound.instance = this;
      this.element = document.createElement('section');
      this.elementContainer = addContainer(this.element);
      this.isMounted = false;
    }

    return NotFound.instance;
  }

  mount(parent) {
    if (this.isMounted) {
      return;
    }

    this.elementContainer.innerHTML = `
    <h2 style="font-size: 48px; margin-bottom: 10px">Страница не найдена</h2>
        <p>Чере 5 секунд вы будете перенаправлены на <a href='/' style="text-decoration: underline">главную страницy</a></p>
    `;

    parent.append(this.element);
    this.isMounted = true;
  }

  unmount() {
    this.element.remove();
    this.isMounted = false;
  }
}
