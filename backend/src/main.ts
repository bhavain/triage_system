import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static frontend files
  // Try different paths based on environment
  const devPublicPath = join(__dirname, '..', 'public');
  const prodPublicPath = join(__dirname, '..', '..', 'public');
  const publicPath = existsSync(prodPublicPath) ? prodPublicPath : devPublicPath;
  const indexPath = join(publicPath, 'index.html');

  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(publicPath);

  // Enable CORS for frontend
  app.enableCors({
    origin: '*', // Configure this properly for production
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // SPA fallback - serve index.html for all non-API, non-static routes
  // This must be added AFTER all other routes are registered
  const express = app.getHttpAdapter().getInstance();
  express.get('*', (req: any, res: any, next: any) => {
    // Skip API routes and static files
    if (req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }
    res.sendFile(indexPath);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 API endpoints available at: http://localhost:${port}/api`);
  console.log(`🎨 Frontend available at: http://localhost:${port}`);
}
bootstrap();
