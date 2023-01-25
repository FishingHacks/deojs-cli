import { Module } from 'deojs';
import { RootModule } from './root/root.module';

@Module({
  imports: [RootModule],
})
export class MainModule {}
