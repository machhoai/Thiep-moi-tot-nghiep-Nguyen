import {
  Camera,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  WebGLRenderer,
} from "three";

export function createSashScene(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  onReady: (ready: boolean) => void,
) {
  const renderer = new WebGLRenderer({ canvas, alpha: true });

  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    transparent: true,
    uniforms: {
      sash: { value: texture },
      elapsed: { value: 0 },
      spread: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 imageUv;

      void main() {
        imageUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D sash;
      uniform float elapsed;
      uniform float spread;
      varying vec2 imageUv;

      float breeze() {
        return 0.85 + 0.22 * sin(elapsed * 0.38)
          + 0.10 * sin(elapsed * 0.89 + 0.9);
      }

      float windPhase(float down, float tail) {
        return elapsed * 1.12 + 0.6 * sin(elapsed * 0.31)
          - down * 7.4 + tail * 1.1;
      }

      // One continuous surface drives both movement and lighting. The upper
      // section stays anchored while broad, slow folds travel toward the tips.
      float clothHeight(vec2 p, float tail) {
        float down = 1.0 - p.y;
        float freeEnd = 0.18 + 0.82 * smoothstep(0.10, 0.96, down);
        float across = (p.x - mix(0.270, 0.730, tail)) / 0.13;
        float phase = windPhase(down, tail);
        float twist = sin(elapsed * 0.72 - down * 3.8 + tail * 1.6);
        return freeEnd * breeze() * (
          0.032 * sin(phase + across * 1.4)
          + 0.009 * sin(across * 5.0 - phase * 0.65)
          + 0.011 * sin(phase * 0.63 + across * 2.3)
          + 0.014 * across * twist
          + 0.004 * smoothstep(0.55, 0.96, down)
            * sin(elapsed * 3.4 - down * 16.0 + across * 2.0 + tail)
        );
      }

      // Anisotropic GGX: satin reflects a broad softbox as a narrow, stretched
      // highlight. The lights stay fixed; only the moving cloth redirects them.
      vec3 satinLight(vec3 base, vec3 normal, vec3 tangent, vec3 weave,
        vec3 light, vec3 radiance, float ink) {
        vec3 view = vec3(0.0, 0.0, 1.0);
        vec3 halfway = normalize(light + view);
        float nl = max(dot(normal, light), 0.001);
        float nv = max(dot(normal, view), 0.001);
        float nh = max(dot(normal, halfway), 0.001);
        float vh = max(dot(view, halfway), 0.0);
        vec2 roughness = vec2(0.19, 0.48);
        vec2 h = vec2(dot(halfway, tangent), dot(halfway, weave)) / roughness;
        float distribution = 1.0 / (3.141593 * roughness.x * roughness.y
          * pow(dot(h, h) + nh * nh, 2.0));
        vec2 l = vec2(dot(light, tangent), dot(light, weave)) * roughness;
        vec2 v = vec2(dot(view, tangent), dot(view, weave)) * roughness;
        float lambdaL = 0.5 * (sqrt(1.0 + dot(l, l) / (nl * nl)) - 1.0);
        float lambdaV = 0.5 * (sqrt(1.0 + dot(v, v) / (nv * nv)) - 1.0);
        float visibility = 1.0 / (1.0 + lambdaL + lambdaV);
        float fresnel = 0.045 + 0.955 * pow(1.0 - vh, 5.0);
        float specular = distribution * visibility * fresnel / (4.0 * nl * nv);
        return radiance * nl * (base * 0.58
          + vec3(specular * mix(0.45, 1.0, ink)));
      }

      void main() {
        float down = 1.0 - imageUv.y;
        float freeEnd = smoothstep(0.12, 0.94, down);
        float tip = smoothstep(0.55, 0.96, down);
        float tail = step(0.5, imageUv.x);
        float wave = windPhase(down, tail);
        float strength = smoothstep(0.0, 2.5, elapsed);
        float gust = breeze();
        float flutter = elapsed * 3.4 - down * 16.0 + tail * 1.7;
        vec2 drift = strength * freeEnd * vec2(
          gust * (0.019 * sin(wave) + 0.005 * sin(wave * 0.63 + tail))
            + 0.0035 * tip * sin(flutter),
          gust * (0.004 * cos(wave * 0.82) + 0.002 * tip * cos(flutter))
        );
        // Preserve the user's wide gap without pushing either hem outside the canvas.
        float edgeRoom = max(0.006, 0.20 - spread - 0.004);
        drift.x = clamp(drift.x, -edgeRoom, edgeRoom);

        vec2 sampleUv = imageUv - drift;
        sampleUv.x -= (tail * 2.0 - 1.0) * spread;
        float center = mix(0.270, 0.730, tail);
        float twist = sin(elapsed * 0.72 - down * 3.8 + tail * 1.6);
        float projectedWidth = 1.0 - 0.13 * strength * freeEnd * twist * twist;
        sampleUv.x = center + (sampleUv.x - center) / projectedWidth;
        // Project the same depth folds into the artwork so the reflected
        // highlight moves with the printed cloth instead of sliding over it.
        sampleUv.x -= clothHeight(sampleUv, tail) * strength * 0.045;

        // Unfurl once: the leading edge is a small cylindrical fold, rather
        // than a flat wipe. A slight delay keeps the two tails from moving in lockstep.
        float progress = clamp((elapsed - 0.12 - tail * 0.16) / 2.8, 0.0, 1.0);
        float opening = 1.0 - pow(1.0 - progress, 3.0);
        float front = mix(0.065, 1.075, opening);
        float radius = 0.035 * (1.0 - smoothstep(0.84, 1.0, opening));
        float edgeDistance = front - down;
        float curl = 1.0 - smoothstep(0.0, max(radius, 0.0001), edgeDistance);
        float angle = acos(clamp(edgeDistance / max(radius, 0.0001), 0.0, 1.0));
        sampleUv.y -= radius * (angle - sin(angle));

        // Only sample each tail's own half so the widening never duplicates the artwork.
        float sameHalf = 1.0 - abs(step(0.5, sampleUv.x) - tail);
        vec4 artwork = texture2D(sash, sampleUv);

        // Finite differences of the same cloth surface produce a moving normal.
        // A broad anisotropic highlight follows the satin weave down each tail.
        float epsilon = 0.001;
        float dx = (clothHeight(sampleUv + vec2(epsilon, 0.0), tail)
          - clothHeight(sampleUv - vec2(epsilon, 0.0), tail)) / (2.0 * epsilon);
        float dy = (clothHeight(sampleUv + vec2(0.0, epsilon), tail)
          - clothHeight(sampleUv - vec2(0.0, epsilon), tail)) / (2.0 * epsilon);
        // Account for the portrait canvas aspect ratio when taking surface slopes.
        dx *= strength / (1350.0 / 2048.0);
        dy *= strength;
        vec3 normal = normalize(vec3(-dx, -dy, 1.0));
        normal = normalize(mix(normal, vec3(0.0, -sin(angle), cos(angle)), curl));
        vec3 tangent = normalize(vec3(1.0, 0.0, dx));
        tangent = normalize(tangent - normal * dot(tangent, normal));
        vec3 weave = normalize(cross(normal, tangent));
        float ink = smoothstep(0.10, 0.70, dot(artwork.rgb, vec3(0.2126, 0.7152, 0.0722)));
        vec3 lit = artwork.rgb * 0.48;
        lit += satinLight(artwork.rgb, normal, tangent, weave,
          normalize(vec3(-0.55, 0.45, 1.0)), vec3(1.12, 1.09, 1.04), ink);
        lit += satinLight(artwork.rgb, normal, tangent, weave,
          normalize(vec3(0.85, 0.10, 0.75)), vec3(0.22, 0.25, 0.30), ink);
        // A soft ridge highlight and dark underside make the opening edge read
        // as rolled satin, including when the main folds are almost still.
        lit += vec3(1.0, 0.98, 0.95) * sin(angle * 2.0) * curl * 0.18 * ink;
        lit *= 1.0 - 0.23 * curl * curl;
        float edgeAA = max(fwidth(down), 0.0001);
        float revealed = smoothstep(-edgeAA, edgeAA, edgeDistance);
        gl_FragColor = vec4(lit, artwork.a * sameHalf * revealed);
        #include <colorspace_fragment>
      }
    `,
  });
  const plane = new Mesh(geometry, material);
  plane.frustumCulled = false;
  const scene = new Scene();
  scene.add(plane);
  const camera = new Camera();

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = true;
  let contextLost = false;
  let frame = 0;
  let lastDraw: number | undefined;
  let elapsed = 0;
  let reportedReady = false;

  function start() {
    if (!frame && visible && !document.hidden && !motion.matches && !contextLost) {
      frame = requestAnimationFrame(draw);
    }
  }

  function draw(now: number) {
    frame = 0;
    if (lastDraw !== undefined) elapsed += (now - lastDraw) / 1000;
    lastDraw = now;
    material.uniforms.elapsed.value = elapsed;
    renderer.render(scene, camera);
    if (!reportedReady) {
      reportedReady = true;
      onReady(true);
    }
    start();
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = undefined;
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    const gap = Number.parseFloat(getComputedStyle(canvas).getPropertyValue("--sash-gap"));
    material.uniforms.spread.value = Number.isFinite(gap) ? gap / 200 : 0;
    const scale = Math.min(window.devicePixelRatio, image.naturalWidth / width, image.naturalHeight / height);
    renderer.setDrawingBufferSize(width, height, scale);
    start();
  }

  function updateMotion() {
    if (motion.matches) {
      stop();
      // Returning to animation must not replay an entrance already seen statically.
      elapsed = Math.max(elapsed, 4);
      reportedReady = false;
      onReady(false);
    } else {
      start();
    }
  }

  function loseContext(event: Event) {
    event.preventDefault();
    contextLost = true;
    stop();
    reportedReady = false;
    onReady(false);
  }

  function restoreContext() {
    contextLost = false;
    start();
  }

  function updateVisibility() {
    if (document.hidden) stop();
    else start();
  }

  const size = new ResizeObserver(resize);
  size.observe(canvas);
  canvas.addEventListener("webglcontextlost", loseContext);
  canvas.addEventListener("webglcontextrestored", restoreContext);
  motion.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateVisibility);
  resize();
  updateMotion();

  return {
    setVisible(next: boolean) {
      visible = next;
      if (visible) start();
      else {
        stop();
      }
    },
    dispose() {
      stop();
      size.disconnect();
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      canvas.removeEventListener("webglcontextlost", loseContext);
      canvas.removeEventListener("webglcontextrestored", restoreContext);
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
