import { env } from './configurations/env/env.config.js';
import { createApp } from './configurations/factory/app.factory.js';

async function bootstrap(): Promise<void> {
  const app = await createApp();

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
