/* Vanilla port of Splice StripeGlassPulse
 * packages/ui/ui-core-alpha/src/components/stripe-glass-pulse.tsx
 * Same defaults and fragment shader as the live sign-in background.
 */
(() => {
  const defaults = {
    pulseSpeed: 0.05,
    pulseLineWidth: 0.0015,
    channelOffset: 0.01,
    ringSpacing: -0.005,
    ringFrequency: 5.0,
    diagonalMod: 0.2,
    uvScale: 2.0,
    pulseFadeIn: 0.18,
    stripGlassStrength: 0.185,
    chromaticStrength: 0.066,
    edgeHighlight: 0,
    edgeSharpness: 15.0,
    grainIntensity: 0.29,
    grainScale: 1.0,
    grainBlend: 1,
    timeStep: 0.05,
  };

  const vertexShader = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform vec2 resolution;
    uniform float time;
    uniform float pulseSpeed;
    uniform float pulseLineWidth;
    uniform float channelOffset;
    uniform float ringSpacing;
    uniform float ringFrequency;
    uniform float diagonalMod;
    uniform float uvScale;
    uniform float pulseFadeIn;
    uniform float stripGlassStrength;
    uniform float chromaticStrength;
    uniform float edgeHighlight;
    uniform float edgeSharpness;
    uniform float grainIntensity;
    uniform float grainScale;
    uniform int grainBlend;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float overlayCh(float base, float top) {
      return base < 0.5
        ? 2.0 * base * top
        : 1.0 - 2.0 * (1.0 - base) * (1.0 - top);
    }

    float pulseChannel(int j, vec2 ringUV, vec2 stripeUV) {
      float t = time * pulseSpeed;
      float dmod = max(diagonalMod, 0.0001);
      float fade = max(pulseFadeIn, 0.0001);
      float acc = 0.0;
      for (int i = 0; i < 5; i++) {
        float phase = fract(t - channelOffset * float(j) + float(i) * ringSpacing);
        float fadeIn = smoothstep(0.0, fade, phase);
        acc += pulseLineWidth * float(i * i) * fadeIn /
          abs(phase * ringFrequency - length(ringUV) + mod(stripeUV.x + stripeUV.y, dmod));
      }
      return acc;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y) * uvScale;
      float dmod = max(diagonalMod, 0.0001);
      float stripCoord = mod(uv.x + uv.y, dmod) / dmod;
      float normalMag = cos(stripCoord * 3.14159265);
      const vec2 acrossDir = vec2(0.70710678, 0.70710678);
      vec2 baseOffset = acrossDir * normalMag * stripGlassStrength;
      vec2 rOff = baseOffset * (1.0 + chromaticStrength);
      vec2 gOff = baseOffset;
      vec2 bOff = baseOffset * (1.0 - chromaticStrength);
      float r = pulseChannel(0, uv + rOff, uv);
      float g = pulseChannel(1, uv + gOff, uv);
      float b = pulseChannel(2, uv + bOff, uv);
      vec3 color = vec3(r, g, b);
      if (edgeHighlight > 0.0) {
        float edge = pow(abs(normalMag), edgeSharpness);
        color += vec3(edge) * edgeHighlight;
      }
      float n = hash(floor(gl_FragCoord.xy / max(grainScale, 1.0)));
      if (grainBlend == 1) {
        vec3 over = vec3(overlayCh(color.r, n), overlayCh(color.g, n), overlayCh(color.b, n));
        color = mix(color, over, grainIntensity);
      } else {
        color += vec3((n - 0.5) * grainIntensity);
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    return shader;
  }

  window.mountStripeGlass = function mountStripeGlass(container) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    container.replaceChildren(canvas);
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) return () => {};

    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name) => gl.getUniformLocation(program, name);
    const locations = Object.fromEntries(
      Object.keys(defaults).map((name) => [name, uniform(name)]),
    );
    const resolution = uniform('resolution');
    const time = uniform('time');
    Object.entries(defaults).forEach(([name, value]) => {
      if (name === 'timeStep' || name === 'grainBlend') return;
      gl.uniform1f(locations[name], value);
    });
    gl.uniform1i(locations.grainBlend, defaults.grainBlend);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let elapsed = 0;
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = () => {
      gl.uniform1f(time, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const animate = () => {
      frame = requestAnimationFrame(animate);
      elapsed += defaults.timeStep;
      draw();
    };
    if (reducedMotion) draw();
    else frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  };
})();
