/** Gaussian elimination with partial pivoting. Returns null if the matrix is singular. */
export function solveLinear(matrix: number[][], vector: number[]): number[] | null {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    let best = Math.abs(a[col][col]);
    for (let row = col + 1; row < n; row++) {
      const value = Math.abs(a[row][col]);
      if (value > best) {
        best = value;
        pivot = row;
      }
    }
    if (best < 1e-12) return null;
    if (pivot !== col) {
      const swap = a[col];
      a[col] = a[pivot];
      a[pivot] = swap;
    }
    const diag = a[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / diag;
      for (let k = col; k <= n; k++) a[row][k] -= factor * a[col][k];
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = a[row][n];
    for (let col = row + 1; col < n; col++) sum -= a[row][col] * x[col];
    x[row] = sum / a[row][row];
  }
  return x;
}
