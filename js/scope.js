/**
 * scope.js - High-Performance 60 FPS HTML5 Canvas Oscilloscope
 * Visualizes Vin, Vref, and Vout traces with CRT grid styling,
 * cause-and-effect shaded regions, hysteresis bands, and crossing markers.
 */

export class Oscilloscope {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    this.ctx = this.canvas.getContext('2d');

    // Ring buffer of samples: { t, vin, vref, vout, vupper, vlower, logic, isCrossing }
    this.buffer = [];
    this.maxBufferDuration = 25.0; // stores up to 25s for flexible windowing

    // Crossings list for flash effects: { t, x, y, age }
    this.crossings = [];

    this.dpr = window.devicePixelRatio || 1;
    this.setupResizeObserver();
  }

  setupResizeObserver() {
    const ro = new ResizeObserver(() => {
      this.resize();
    });
    ro.observe(this.container);
    this.resize();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear() {
    this.buffer = [];
  }

  /**
   * Pre-fills oscilloscope buffer with a flat baseline across the active time window.
   * Useful when starting in or switching to Manual DC mode so old waves are wiped instantly.
   */
  fillBaseline(state) {
    this.buffer = [];
    const win = state.timeWindow || 8.0;
    const curT = state.time;
    const step = Math.max(0.02, win / 160);
    for (let t = curT - win; t <= curT; t += step) {
      this.buffer.push({
        t: t,
        vin: state.vin,
        vref: state.vref,
        vout: state.vout,
        vupper: state.vupper,
        vlower: state.vlower,
        logic: state.logic
      });
    }
  }

  /**
   * Adds a new time sample to the ring buffer
   */
  addSample(sample) {
    // If simulation time jumped backwards or was reset, clear stale buffer immediately!
    if (this.buffer.length > 0 && sample.t < this.buffer[this.buffer.length - 1].t) {
      this.buffer = [];
    }

    this.buffer.push(sample);

    // Prune buffer older than current time - maxBufferDuration
    const cutoff = sample.t - this.maxBufferDuration;
    while (this.buffer.length > 0 && this.buffer[0].t < cutoff) {
      this.buffer.shift();
    }
  }

  /**
   * Main render call invoked each frame
   * @param {Object} state - current simulation state
   */
  draw(state) {
    if (!this.width || !this.height) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Margins for axes and labels
    const padLeft = 52;
    const padRight = 20;
    const padTop = 18;
    const padBottom = 26;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Y Axis scaling: 0V to VCC with 10% headroom
    const vcc = Math.max(3.0, state.vcc);
    const yMax = vcc * 1.08;
    const yMin = -vcc * 0.04; // slight floor clearance

    const toY = (v) => {
      const norm = (v - yMin) / (yMax - yMin);
      return padTop + plotH * (1.0 - norm);
    };

    const curT = state.time;
    const win = state.timeWindow || 8.0;
    const minT = curT - win;

    const toX = (t) => {
      const norm = (t - minT) / win;
      return padLeft + norm * plotW;
    };

    // 1. Clear Canvas with CRT Background
    ctx.fillStyle = '#040812';
    ctx.fillRect(0, 0, w, h);

    // 2. Filter visible samples in window
    let visibleSamples = [];
    for (let i = 0; i < this.buffer.length; i++) {
      const s = this.buffer[i];
      if (s.t >= minT - 0.5) {
        visibleSamples.push(s);
      }
    }

    // 3. Draw Shaded Cause-and-Effect Regions (Vin < Vref vs Vin > Vref)
    if (state.showShading && visibleSamples.length > 1) {
      ctx.save();
      for (let i = 0; i < visibleSamples.length - 1; i++) {
        const s1 = visibleSamples[i];
        const s2 = visibleSamples[i + 1];
        const x1 = Math.max(padLeft, toX(s1.t));
        const x2 = Math.min(padLeft + plotW, toX(s2.t));
        if (x2 <= x1) continue;

        // In inverting mode: Vin < Vref causes HIGH (green shade), Vin > Vref causes LOW (red shade)
        // In non-inverting: mirrored
        const isVinBelow = s1.vin < s1.vref;
        if (state.mode === 'inverting') {
          ctx.fillStyle = isVinBelow ? 'rgba(52, 211, 153, 0.06)' : 'rgba(251, 75, 110, 0.06)';
        } else {
          ctx.fillStyle = isVinBelow ? 'rgba(251, 75, 110, 0.06)' : 'rgba(52, 211, 153, 0.06)';
        }
        ctx.fillRect(x1, padTop, x2 - x1, plotH);
      }
      ctx.restore();
    }

    // 4. Draw Oscilloscope Grid & Divisions
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Time Vertical Grid Lines
    const numTimeDivs = 8;
    for (let i = 0; i <= numTimeDivs; i++) {
      const x = padLeft + (plotW / numTimeDivs) * i;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      // Time label on X-axis
      const tDelta = ((i / numTimeDivs - 1) * win).toFixed(1);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${tDelta}s`, x, padTop + plotH + 16);
    }

    // Voltage Horizontal Grid Lines
    const numVoltsDivs = 5;
    for (let i = 0; i <= numVoltsDivs; i++) {
      const vVal = (vcc / numVoltsDivs) * i;
      const y = toY(vVal);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      // Voltage label on Y-axis
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${vVal.toFixed(1)}V`, padLeft - 8, y + 3.5);
    }
    ctx.restore();

    // 5. Draw Hysteresis Band (if active)
    if (state.hysteresis > 0.01) {
      const yUpper = toY(state.vupper);
      const yLower = toY(state.vlower);
      
      // Translucent amber ribbon
      ctx.save();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.fillRect(padLeft, yUpper, plotW, yLower - yUpper);

      // Dashed boundary lines
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(padLeft, yUpper);
      ctx.lineTo(padLeft + plotW, yUpper);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padLeft, yLower);
      ctx.lineTo(padLeft + plotW, yLower);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw Vref Reference Line (amber dashed)
    if (state.showVref) {
      const yRef = toY(state.vref);
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(padLeft, yRef);
      ctx.lineTo(padLeft + plotW, yRef);
      ctx.stroke();

      // Vref badge on axis
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Vref`, padLeft - 8, yRef - 6);
      ctx.restore();
    }

    // 7. Draw Vout Output Trace (green/magenta square wave)
    if (state.showVout && visibleSamples.length > 1) {
      ctx.save();
      ctx.lineWidth = 2.4;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      for (let i = 0; i < visibleSamples.length; i++) {
        const s = visibleSamples[i];
        const x = toX(s.t);
        const y = toY(s.vout);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Sharp step transitions for square wave
          const prevX = toX(visibleSamples[i - 1].t);
          const prevY = toY(visibleSamples[i - 1].vout);
          if (Math.abs(s.vout - visibleSamples[i - 1].vout) > 0.1) {
            ctx.lineTo(x, prevY);
          }
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = '#34d399';
      ctx.shadowColor = 'rgba(52, 211, 153, 0.5)';
      ctx.stroke();
      ctx.restore();
    }

    // 8. Draw Vin Input Trace (Cyan glow)
    if (state.showVin && visibleSamples.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(34, 211, 238, 0.55)';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      for (let i = 0; i < visibleSamples.length; i++) {
        const s = visibleSamples[i];
        const x = toX(s.t);
        const y = toY(s.vin);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 9. Crossing Flash Markers & Current Head Dot
    if (visibleSamples.length > 0) {
      const latest = visibleSamples[visibleSamples.length - 1];
      const headX = toX(latest.t);
      const headY = toY(latest.vin);

      // Glowing dot at the leading tip of Vin
      if (headX >= padLeft && headX <= padLeft + plotW) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(headX, headY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw vertical threshold crossing flash lines
      ctx.save();
      for (let i = 1; i < visibleSamples.length; i++) {
        const s = visibleSamples[i];
        const prev = visibleSamples[i - 1];
        if (s.logic !== prev.logic) {
          const crossX = toX(s.t);
          if (crossX >= padLeft && crossX <= padLeft + plotW) {
            ctx.strokeStyle = s.logic === 1 ? 'rgba(52, 211, 153, 0.65)' : 'rgba(251, 75, 110, 0.65)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(crossX, padTop);
            ctx.lineTo(crossX, padTop + plotH);
            ctx.stroke();

            // Marker dot
            ctx.fillStyle = s.logic === 1 ? '#34d399' : '#fb4b6e';
            ctx.beginPath();
            ctx.arc(crossX, toY(s.vin), 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // Plot Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, plotW, plotH);
  }
}
