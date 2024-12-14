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


@fragment
fn main(
  @location(0) fragPosition: vec4f,
  @location(1) fragUV : vec2f,
) -> @location(0) vec4f {

    var centered = fragUV+ vec2f(-0.5, -0.5);
    // var dist = length(centered);
    var normalizedCoord : vec2f = abs(centered);
    var angle : f32 = utils.totalTime * 0.00012;
    for (var i: f32 = 0; i<32.0; i += 1.0) {
        normalizedCoord = abs(normalizedCoord);
        normalizedCoord -= 0.25;
        normalizedCoord *= 1.1;
        normalizedCoord *= mat2x2(
            cos(angle), -sin(angle),
            sin(angle),  cos(angle)
        );
    }
    return vec4f(
        vec3f(
            length(normalizedCoord),
            length(normalizedCoord)+0.4,
            length(normalizedCoord)+0.6
        ), 
        1.0);
}
