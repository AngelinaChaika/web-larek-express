import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { UPLOAD_PATH_TEMP } from '../config';
import { serverLogger } from '../middlewares/logger';

type FileSystemError = Error & { code?: string };

const MAX_FILE_AGE = 24 * 60 * 60 * 1000;

async function cleanupTemp() {
  const tempDirPath = path.resolve(__dirname, '..', '..', UPLOAD_PATH_TEMP);
  const files = await fs.readdir(tempDirPath);

  const promises = files.map(async (file) => {
    const filePath = path.join(tempDirPath, file);

    try {
      const fileStats = await fs.stat(filePath);
      const fileAge = Date.now() - fileStats.mtimeMs;

      if (fileAge > MAX_FILE_AGE) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      const fsError = error as FileSystemError;

      if (fsError.code === 'ENOENT') {
        return;
      }

      throw error;
    }
  });

  await Promise.all(promises);
}

cron.schedule('0 * * * *', async () => {
  try {
    await cleanupTemp();
  } catch (error) {
    serverLogger.error(error);
  }
});
