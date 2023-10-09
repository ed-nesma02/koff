import axios from 'axios';
import {API_URL} from '../const';
import {StorageService} from './StorageService';

export class ApiService {
  #apiUrl = API_URL;

  constructor() {
    this.accessKey = new StorageService().get('accessKey');
  }

  async getAccessKey() {
    try {
      if (!this.accessKey) {
        const response = await axios.get(`${this.#apiUrl}api/users/accessKey`);
        this.accessKey = response.data.accessKey;
        new StorageService().set('accessKey', this.accessKey);
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
        new StorageService().delete('accessKey')

        return this.getData(pathname, params);
      } else {
        console.log(error);
      }
    }
  }

  async getProducts(page, limit, list, category, q) {
    return await this.getData('api/products', {
      page,
      limit,
      list,
      category,
      q,
    });
  }

  async getProductCategories() {
    {
      return await this.getData('api/productCategories');
    }
  }

  async getProductById(id) {
    {
      return await this.getData(`/api/products/${id}`);
    }
  }
}
