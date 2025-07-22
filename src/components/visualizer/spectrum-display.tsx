'use client';

import React, { useRef, useEffect } from 'react';
import { SpectrumData } from '@/types/rf';

interface SpectrumDisplayProps {
  /** The spectrum data to display */
  spectrumData: SpectrumData | null;

  /** Display dimensions */
  width?: number;
  height?: number;

  /** Display range in dB */
  minDb?: number;
  maxDb?: number;

  /** Title for the display */
  title?: string;
}

/**
 * Spectrum Display Component
 *
 * Shows frequency (X-axis) vs signal strength in dB (Y-axis)
 * Like an equalizer display but for any frequency range
 */
export default function SpectrumDisplay({
  spectrumData,
  width = 800,
  height = 400,
  minDb = -100,
  maxDb = 0,
  title = "Spectrum Analyzer"
}: SpectrumDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw whenever data changes
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background and grid
    drawBackground(ctx, width, height);
    drawGrid(ctx, width, height, minDb, maxDb);

    // Draw spectrum data if available
    if (spectrumData) {
      drawSpectrum(ctx, spectrumData, width, height, minDb, maxDb);
      drawFrequencyLabels(ctx, spectrumData, width, height);
    }

    // Draw dB scale labels
    drawDbLabels(ctx, width, height, minDb, maxDb);

  }, [spectrumData, width, height, minDb, maxDb]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      {/* Title */}
      <div className="text-white text-lg font-mono mb-2 text-center">
        {title}
      </div>

      {/* Status info */}
      {spectrumData && (
        <div className="text-gray-400 text-sm font-mono mb-2 flex justify-between">
          <span>Bins: {spectrumData.frequencies.length}</span>
          <span>Resolution: {spectrumData.binWidth.toFixed(1)} Hz</span>
          <span>Range: {(spectrumData.frequencies[0] / 1000).toFixed(1)}k - {(spectrumData.frequencies[spectrumData.frequencies.length-1] / 1000).toFixed(1)}k Hz</span>
        </div>
      )}

      {/* The actual spectrum display */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-600 bg-black"
      />

      {/* Instructions */}
      {!spectrumData && (
        <div className="text-gray-500 text-center mt-4 italic">
          No signal data - generate a test signal to see the spectrum
        </div>
      )}
    </div>
  );
}

/**
 * Draw the black background
 */
function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw grid lines for easier reading
 */
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, minDb: number, maxDb: number) {
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;

  // Vertical grid lines (frequency divisions)
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal grid lines (dB divisions)
  const dbRange = maxDb - minDb;
  const dbStep = dbRange / 8; // 8 horizontal lines

  for (let i = 0; i <= 8; i++) {
    const y = (i / 8) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw the actual spectrum line
 */
function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: SpectrumData,
  width: number,
  height: number,
  minDb: number,
  maxDb: number
) {
  if (data.magnitudes.length === 0) return;

  ctx.strokeStyle = '#00ff00'; // Classic "oscilloscope green"
  ctx.lineWidth = 2;
  ctx.beginPath();

  const dbRange = maxDb - minDb;

  for (let i = 0; i < data.magnitudes.length; i++) {
    // Convert frequency bin to X position
    const x = (i / data.magnitudes.length) * width;

    // Convert dB value to Y position (flip Y axis - higher dB = lower on screen)
    const normalizedDb = Math.max(0, Math.min(1, (data.magnitudes[i] - minDb) / dbRange));
    const y = height - (normalizedDb * height);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Optional: Fill area under curve for better visibility
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw frequency labels on X-axis
 */
function drawFrequencyLabels(ctx: CanvasRenderingContext2D, data: SpectrumData, width: number, height: number) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';

  const maxFreq = data.frequencies[data.frequencies.length - 1];

  // Show 5 frequency labels across the bottom
  for (let i = 0; i <= 5; i++) {
    const x = (i / 5) * width;
    const freq = (i / 5) * maxFreq;

    let label: string;
    if (freq >= 1000000) {
      label = `${(freq / 1000000).toFixed(1)}M`;
    } else if (freq >= 1000) {
      label = `${(freq / 1000).toFixed(1)}k`;
    } else {
      label = `${freq.toFixed(0)}`;
    }

    ctx.fillText(`${label}Hz`, x, height - 5);
  }
}

/**
 * Draw dB scale labels on Y-axis
 */
function drawDbLabels(ctx: CanvasRenderingContext2D, width: number, height: number, minDb: number, maxDb: number) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';

  const dbRange = maxDb - minDb;

  // Show dB labels on the left side
  for (let i = 0; i <= 8; i++) {
    const y = (i / 8) * height + 5;
    const db = maxDb - (i / 8) * dbRange;
    ctx.fillText(`${db.toFixed(0)}dB`, 5, y);
  }
}
