export async function  groupBy<T>(items: T[], n: number): Promise<T[][]> {
    const count = Math.ceil(items.length / n);
    const groups: T[][] = Array(count);
    for (let index = 0; index < count; index++) {
      groups[index] = items.slice(index * n, index * n + n);
    }
    return groups;
  }