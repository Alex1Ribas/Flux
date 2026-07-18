import type { Express } from 'express';
import { createHttpServer } from '../configurations/factory/app.factory.js';

let testApp: Express | undefined;

export function getTestApp(): Express {
  if (!testApp) {
    testApp = createHttpServer().app;
  }
  return testApp;
}
