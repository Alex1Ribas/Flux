import type { Router } from 'express';
import type { IController } from '../../domain/server/interfaces/IController.js';

export function getControllerRouter(controller: IController): Router {
  return controller.router as Router;
}
