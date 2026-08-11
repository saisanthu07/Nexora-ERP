import app from './app';
import { env } from './config/env';

app.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Nexora ERP API listening on 0.0.0.0:${env.PORT} [${env.NODE_ENV}]`);
});
