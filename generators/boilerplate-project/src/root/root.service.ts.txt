import { Injectable } from 'deojs';

@Injectable
export class RootService {
  helloWorld(name?: string) {
    return 'Hello, ' + (name || 'World') + '!';
  }
}
