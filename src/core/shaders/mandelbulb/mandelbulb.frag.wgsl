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
	let rotX: mat3x3<f32> = mat3x3<f32>(1., 0., 0., 0., cos(x), -sin(x), 0., sin(x), cos(x));
	let rotY: mat3x3<f32> = mat3x3<f32>(cos(y), 0., sin(y), 0., 1., 0., -sin(y), 0., cos(y));
	let rotZ: mat3x3<f32> = mat3x3<f32>(cos(z), -sin(z), 0., sin(z), cos(z), 0., 0., 0., 1.);
	return rotX * rotY * rotZ * pos;
} 

fn rot2d(a: f32) -> mat2x2<f32> {
	let s: f32 = sin(a);
	let c: f32 = cos(a);
	return mat2x2<f32>(c, -s, s, c);
} 

fn hit(r: vec3<f32>) -> f32 {
	var r_var = r;
	r_var = abs(r_var);
	var zn: vec3<f32> = vec3<f32>(r_var.xyz);
	var rad: f32 = 0.;
	var hit: f32 = 0.;
	var p: f32 = 8.;
	var d: f32 = 1.;

	for (var i: i32 = 0; i < 20; i = i + 1) {
		rad = length(zn);
		if (rad > 2.) {
			hit = 0.5 * log(rad) * rad / d;
		} else { 
			let th : f32 = atan2( length( zn.xy ), zn.z );
			let phi : f32 = atan2( zn.y, zn.x );		
			let rado : f32 = pow(rad,8.0);

			d = pow(rad, 8.) * 8. * d + 1.;
			let sint: f32 = sin(th * p);
			zn.x = rado * sint * cos(phi * p);
			zn.y = rado * sint * sin(phi * p);
			zn.z = rado * cos(th * p);
			zn = zn + (r_var * 1.);
		}
	}

	return hit;
} 

fn getDist(p: vec3<f32>) -> f32 {
	let d: f32 = hit(rotate(p, 0, 0, 0)/6.0) * 6.0;
	return d;
} 

fn getNormal(p: vec3<f32>) -> vec3<f32> {
	let e: vec2<f32> = vec2<f32>(0.005, 0.);
	var n: vec3<f32> = getDist(p) - vec3<f32>(getDist(p - e.xyy), getDist(p - e.yxy), getDist(p - e.yyx));
	return normalize(n);
} 

fn doMarch(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
    var t: f32 = 0.0;
    for (var i: f32 = 0.0; i < 100.0; i += 1.0) {
        let pos = ro + rd * t;
        let dist = getDist(pos);
        t += dist;

        if (dist < 0.001) {
            break; // found something
        }
        if (abs(t) > 1000.0) {
            break; // went too far ahead
        }
    }
    return t;
}

fn softshadow(ro: vec3<f32>, rd: vec3<f32>, k: f32) -> f32 {
    var akuma = 1.0;
    var h = 0.0;
    var t = 0.01;
    for (var i: i32 = 0; i < 50; i++) {
        h = hit(ro + rd * t);
        if (h < 0.001) {return 0.08;}
        akuma = min(akuma, k * h / t);
        t += clamp(h, 0.01, 2.0);
    }
    return akuma;
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

    let sundir = normalize(vec3<f32>(0.1, 0.8, 0.6)); 
    let sun = vec3<f32>(1.64, 1.27, 0.99); 

    var ro = camera.rayOrigin.xyz;
    var forward = normalize(vec3<f32>(0.0) - ro);
    let right = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), forward));
    let up = cross(forward, right);

    ro += camera.posOffset.x * right; // Horizontal pan
    ro += camera.posOffset.y * up;     // Vertical pan
    var rd = normalize(uv.x * right + uv.y * up + forward);
    var col = vec3<f32>(0.02);
    
    let marchOut = doMarch(ro, rd);

    if (marchOut < 100.0) {
        // let p = ro + rd * marchOut;
        // let n = getNormal(p);
        // let r = reflect(rd, n);

        // let dif = dot(n, normalize(vec3<f32>(0,1,0)))*.5+.5;
        
        // col = vec3<f32>(mix(vec3<f32>(0.38, 0.27, 0.63), vec3<f32>(0.87,0.84,0.1), dif));
        // col = vec3<f32>(col);
        let p = ro + rd * marchOut;
        let n = getNormal(p);
        let shadow = softshadow(p, sundir, 10.0);
        let diff = max(0.0, dot(n, sundir));
        let bac = max(0.3 + 0.7 * dot(vec3<f32>(-sundir.x, -1.0, -sundir.z), n), 0.0); 
        
        col = diff * shadow * sun * 4.5;
        col += 0.2 * bac * sun; 
        let tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 + vec3<f32>(0.0, 0.5, 1.0));
        col *= vec3<f32>(0.9, 0.8, 0.6) * 0.2 * tc0;
    }

    col = pow(clamp(col, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.55)); 
    col = mix(col, vec3<f32>(dot(col, vec3<f32>(0.33))), -0.5);

    return vec4<f32>(col, 1.0);
}