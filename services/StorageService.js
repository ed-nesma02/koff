import axios from 'axios';
import {API_URL} from '../const';

export class StorageService {

  constructor() {}

  get(name) {
    return localStorage.getItem(name);
  }
  set(name, item) {
    return localStorage.setItem(name, item);
  }
  delete(name) {
    return localStorage.removeItem(name);
  }
}
