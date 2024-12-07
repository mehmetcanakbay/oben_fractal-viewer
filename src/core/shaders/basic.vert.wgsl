struct VertexOutput {
  @builtin(position) Position : vec4f,
  @location(0) fragPosition: vec4f,
  @location(1) fragUV : vec2f,
}

@vertex
fn main(
  @location(0) position : vec4f,
  @location(1) uv : vec2f
) -> VertexOutput {
    
  var output : VertexOutput;
  output.Position = position;
  output.fragPosition = position;
  output.fragUV = uv;

  return output;
}
