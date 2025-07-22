/**
 * Windowing functions are used to reduce "spectral leakage" in FFT analysis
 *
 * The Problem: When we analyze a chunk of signal, we're essentially "cutting" it.
 * This creates sharp edges that don't exist in the real signal, causing false frequencies.
 *
 * The Solution: Gradually fade the signal to zero at the edges using a window function.
 *
 * Analogy: Like using a soft brush instead of a hard edge when painting
 */
export class WindowFunctions {

  /**
   * Rectangular window - no modification (just for comparison)
   * This is what happens if you DON'T apply windowing
   */
  static rectangular(length: number): Float32Array {
    const window = new Float32Array(length);

    // All values are 1.0 - no modification to the signal
    for (let i = 0; i < length; i++) {
      window[i] = 1.0;
    }

    return window;
  }

  /**
   * Hanning window - smooth bell curve, good general purpose window
   * Most commonly used in audio/RF analysis
   */
  static hanning(length: number): Float32Array {
    const window = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      // Mathematical formula for Hanning window
      // Creates a smooth curve that goes from 0 to 1 and back to 0
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
    }

    return window;
  }

  /**
   * Hamming window - similar to Hanning but slightly different shape
   * Better at reducing side lobes (false frequencies)
   */
  static hamming(length: number): Float32Array {
    const window = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      // Hamming window formula - similar to Hanning but with different coefficients
      window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (length - 1));
    }

    return window;
  }

  /**
   * Applies a window function to a signal
   *
   * @param signal - The signal samples to window
   * @param windowType - Which window function to use
   * @returns - The windowed signal (original signal * window function)
   */
  static applyWindow(signal: Float32Array, windowType: 'rectangular' | 'hanning' | 'hamming'): Float32Array {
    let window: Float32Array;

    // Choose the appropriate window function
    switch (windowType) {
      case 'rectangular':
        window = this.rectangular(signal.length);
        break;
      case 'hanning':
        window = this.hanning(signal.length);
        break;
      case 'hamming':
        window = this.hamming(signal.length);
        break;
      default:
        throw new Error(`Unknown window type: ${windowType}`);
    }

    // Apply the window by multiplying signal * window
    const windowedSignal = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
      windowedSignal[i] = signal[i] * window[i];
    }

    return windowedSignal;
  }
}
