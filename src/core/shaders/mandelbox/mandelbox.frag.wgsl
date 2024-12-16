struct Utils {
    deltaTime: f32,
    totalTime: f32,
    resolution: vec2<f32>
};

struct Camera {
    rayOrigin: vec4<f32>,
    posOffset: vec4<f32>,
    rotationOffset: vec4<f32>,
}

@group(0) @binding(0) var<uniform> utils: Utils;
@group(0) @binding(1) var<uniform> camera: Camera;


fn rotate(pos: vec3<f32>, x: f32, y: f32, z: f32) -> vec3<f32> {
    let rotX = mat3x3<f32>(1.0, 0.0, 0.0, 
                         0.0, cos(x), -sin(x), 
                         0.0, sin(x), cos(x));
    let rotY = mat3x3<f32>(cos(y), 0.0, sin(y), 
                         0.0, 1.0, 0.0, 
                         -sin(y), 0.0, cos(y));
    let rotZ = mat3x3<f32>(cos(z), -sin(z), 0.0, 
                         sin(z), cos(z), 0.0, 
                         0.0, 0.0, 1.0);
    return pos * rotZ * rotY * rotX;
}

fn rot2d(a: f32) -> mat2x2<f32> {
    let s = sin(a);
    let c = cos(a);
    return mat2x2<f32>(c, -s, s, c);
}

fn hit(r: vec3<f32>) -> f32 {
    const SCALE: f32 = 2.;
    const fixedRadius: f32 = 1.0;
    const minRadius: f32 = 0.5;
    const iters: i32 = 10;

    let fR2 = fixedRadius * fixedRadius;
    let MR2 = minRadius * minRadius;
    let scalevec = vec4<f32>(SCALE, SCALE, SCALE, abs(SCALE)) / MR2;
    let C1 = abs(SCALE - 1.0);
    let C2 = pow(abs(SCALE), f32(1 - iters));

    var p = vec4<f32>(r, 1.0);
    // p -= vec4<f32>(camera.posOffset.xyz, 0.0);
    let p0 = p;

    for (var i: i32 = 0; i < iters; i++) {
        let clampedXYZ = clamp(p.xyz, vec3<f32>(-1.0), vec3<f32>(1.0));
        p = vec4<f32>(clampedXYZ * 2.0 - p.xyz, p.w); // Update p as a whole
        
        let r2 = dot(p.xyz, p.xyz);
        p *= clamp(max(MR2 / r2, MR2), 0.0, 1.0);
        p = p * scalevec + p0;
    }

    return (length(p.xyz) - C1) / p.w - C2;
}

fn softshadow(ro: vec3<f32>, rd: vec3<f32>, k: f32) -> f32 {
    var akuma = 1.0;
    var h = 0.0;
    var t = 0.01;
    for (var i: i32 = 0; i < 50; i++) {
        h = hit(ro + rd * t);
        if (h < 0.001) {return 0.02;}
        akuma = min(akuma, k * h / t);
        t += clamp(h, 0.01, 2.0);
    }
    return akuma;
}

fn getDist(p: vec3<f32>) -> f32 {
    return hit(p);
}

fn getNormal(p: vec3<f32>) -> vec3<f32> {
    let e = vec2<f32>(0.0005, 0.0);
    var n = getDist(p) - vec3<f32>(
        getDist(p - vec3<f32>(e.x, 0.0, 0.0)),
        getDist(p - vec3<f32>(0.0, e.x, 0.0)),
        getDist(p - vec3<f32>(0.0, 0.0, e.x))
    );
    return normalize(n);
}

fn doMarch(ro: vec3<f32>, rd: vec3<f32>, steps: ptr<function, f32>) -> f32 {
    var t: f32 = 0.0;
    for (var i: f32 = 0.0; i < 100.0; i += 1.0) {
        let pos = ro + rd * t;
        let dist = getDist(pos);
        t += dist;

        if (dist < 0.001) {
            break; // found something
        }
        if (t > 100.0) {
            break; // went too far ahead
        }
    }
    return t;
}


@fragment
fn main(
    @location(0) fragPosition: vec4<f32>,
    @location(1) fragUV: vec2<f32>,
) -> @location(0) vec4f {
    let aspectRatio = utils.resolution.x / utils.resolution.y;

    var uv = fragUV; 
    uv = (uv-0.5);
    uv.x *= aspectRatio;
    var ro = camera.rayOrigin.xyz;
    
    let sundir = normalize(vec3<f32>(0.1, 0.8, 0.6)); 
    let sun = vec3<f32>(1.64, 1.27, 0.99); 

    var forward = normalize(vec3<f32>(0.0) - ro);
    let right = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), forward));
    let up = cross(forward, right);
    
    ro += camera.posOffset.x * right; // Horizontal pan
    ro += camera.posOffset.y * up;     // Vertical pan
    var rd = normalize(uv.x * right + uv.y * up + forward);
    var col = vec3<f32>(0.02);
    
    var steps: f32;
    let marchOut = doMarch(ro, rd, &steps);

    if (marchOut < 100.0) {
        let p = ro + rd * marchOut;
        let n = getNormal(p);
        let shadow = softshadow(p, sundir, 10.0);
        let diff = max(0.0, dot(n, sundir));
        let bac = max(0.3 + 0.7 * dot(vec3<f32>(-sundir.x, -1.0, -sundir.z), n), 0.0); 

        var ao = steps * 0.015;
        ao = 1. - ao / (ao + 1.0);  // reinhard
        ao = pow(ao, 2.);

        col = diff * shadow * sun * 4.5 * ao;
        col += 0.2 * bac * sun; 
        let tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 + vec3<f32>(0.0, 0.5, 1.0));
        col *= vec3<f32>(0.9, 0.8, 0.6) * 0.2 * tc0;
    } 
    
    col = pow(clamp(col, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.55)); 
    col = mix(col, vec3<f32>(dot(col, vec3<f32>(0.33))), -0.5);

    return vec4<f32>(col, 1.0);
}
