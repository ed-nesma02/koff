import axios from 'axios';
import {API_URL} from '../const';
import {AccessKeyService} from './StorageService';

export class ApiService {
  #apiUrl = API_URL;

  constructor() {
    this.accessKeyService = new AccessKeyService('accessKey');
    this.accessKey = this.accessKeyService.get();
  }

  async getAccessKey() {
    try {
      if (!this.accessKey) {
        const response = await axios.get(`${this.#apiUrl}api/users/accessKey`);
        this.accessKey = response.data.accessKey;
        this.accessKeyService.set(this.accessKey);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getData(pathname, params = {}) {
    if (!this.accessKey) {
      await this.getAccessKey();
    }
    try {
      const response = await axios.get(`${this.#apiUrl}${pathname}`, {
        headers: {
          Authorization: `Bearer ${this.accessKey}`,
        },
        params,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.accessKey = null;
        this.accessKeyService.delete();

        return this.getData(pathname, params);
      } else {
        console.log(error);
      }
    }
  }

  async getProducts(params = {}) {
    if (params.list) {
      params.list = params.list.join(',');
    }
    return await this.getData('api/products', params);
  }

  async getProductCategories() {
    {
      return await this.getData('api/productCategories');
    }
  }

  async getProductById(id) {
    {
      return await this.getData(`api/products/${id}`);
    }
  }

  async postProductToCart(productId, quantity = 1) {
    if (!this.accessKey) {
      await this.getAccessKey();
    }

    try {
      const response = await axios.post(
        `${this.#apiUrl}api/cart/products`,
        {
          productId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.accessKey = null;
        this.accessKeyService.delete();

        return await this.getAccessKey();
      }
      console.error(error);
    }
  }

  async updateQuantityProductToCart(productId, quantity) {
    if (!this.accessKey) {
      await this.getAccessKey();
    }

    try {
      const response = await axios.put(
        `${this.#apiUrl}api/cart/products`,
        {
          productId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.accessKey = null;
        this.accessKeyService.delete();

        return await this.getAccessKey();
      }
      console.error(error);
    }
  }

  async getCart() {
    return await this.getData('api/cart');
  }

  async deleteProductFromCart(id) {
    if (!this.accessKey) {
      await this.getAccessKey();
    }

    try {
      const response = await axios.delete(
        `${this.#apiUrl}api/cart/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.accessKey = null;
        this.accessKeyService.delete();

        return await this.getAccessKey();
      }
      console.error(error);
    }
  }

  async postOrder(data) {
    if (!this.accessKey) {
      await this.getAccessKey();
    }

    try {
      const response = await axios.post(
        `${this.#apiUrl}api/orders`, data,
        {
          headers: {
            Authorization: `Bearer ${this.accessKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.accessKey = null;
        this.accessKeyService.delete();

        return await this.getAccessKey();
      }
      console.error(error);
    }
  }

  async getOrder(id) {
    return await this.getData(`api/orders/${id}`);
  }
}
