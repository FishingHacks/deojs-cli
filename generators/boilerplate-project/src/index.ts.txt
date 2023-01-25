import { Server } from 'deojs';
import { ENV } from './env';
import { MainModule } from './main.module';

function bootstrap() {
  class CustomServer extends Server {
    constructor() {
      super(ENV === 'dev');

      this.addModule(MainModule);
    }
  }
  new CustomServer().start();
}
bootstrap();
