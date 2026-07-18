import express from 'express';
import { createApp } from './configurations/factory/app.factory.js';

const app: ReturnType<typeof express> = await createApp();

export default app;
