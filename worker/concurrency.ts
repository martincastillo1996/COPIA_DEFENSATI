/**
 * DEFENSA TI - Control de Concurrencia para Worker VPS DigitalOcean
 * Limita el procesamiento a un máximo de 3 dominios en paralelo para no saturar
 * la memoria RAM ni la CPU de droplets modestos (ej. 1 vCPU / 1GB RAM).
 */

export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  taskFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(workerId: number): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      const item = items[currentIndex];
      try {
        results[currentIndex] = await taskFn(item, currentIndex);
      } catch (err) {
        console.error(`[Worker ${workerId}] Error procesando item ${currentIndex}:`, err);
        throw err;
      }
    }
  }

  const workersCount = Math.min(limit, items.length);
  const workerPromises: Promise<void>[] = [];

  for (let i = 0; i < workersCount; i++) {
    workerPromises.push(worker(i + 1));
  }

  await Promise.all(workerPromises);
  return results;
}
