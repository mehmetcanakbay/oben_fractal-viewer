vec3 rotate( vec3 pos, float x, float y, float z )
{
	mat3 rotX = mat3( 1.0, 0.0, 0.0, 0.0, cos( x ), -sin( x ), 0.0, sin( x ), cos( x ) );
	mat3 rotY = mat3( cos( y ), 0.0, sin( y ), 0.0, 1.0, 0.0, -sin(y), 0.0, cos(y) );
	mat3 rotZ = mat3( cos( z ), -sin( z ), 0.0, sin( z ), cos( z ), 0.0, 0.0, 0.0, 1.0 );

	return rotX * rotY * rotZ * pos;
}

mat2 rot2d(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float hit( vec3 r )
{
    float SCALE = 2.;
    float fixedRadius = 1.0;
    float fR2 = fixedRadius * fixedRadius;
    float minRadius = 0.5;
    float MR2 = minRadius * minRadius;
    int iters = 10;
    
    //https://www.fractalforums.com/3d-fractal-generation/a-mandelbox-distance-estimate-formula/15/
    vec4 scalevec = vec4(SCALE, SCALE, SCALE, abs(SCALE)) / MR2;
    float C1 = abs(SCALE-1.0), C2 = pow(abs(SCALE), float(1-iters));

    // distance estimate
    vec4 p = vec4(r.xyz, 1.0), p0 = vec4(r.xyz, 1.0);  // p.w is knighty's DEfactor
    for (int i=0; i<iters; i++) {
        p.xyz = clamp(p.xyz, -1.0, 1.0) * 2.0 - p.xyz;  // box fold: min3, max3, mad3
        float r2 = dot(p.xyz, p.xyz);  // dp3
        p.xyzw *= clamp(max(MR2/r2, MR2), 0.0, 1.0);  // sphere fold: div1, max1.sat, mul4
        p.xyzw = p*scalevec + p0;  // mad4
    }
    
    return (length(p.xyz) - C1) / p.w - C2;
}

float softshadow(vec3 ro, vec3 rd, float k ) { 
     float akuma=1.0,h=0.0; 
	 float t = 0.01;
     for(int i=0; i < 50; ++i){ 
         h=hit(ro+rd*t); 
         if(h<0.001)return 0.02; 
         akuma=min(akuma, k*h/t); 
 		 t+=clamp(h,0.01,2.0); 
     } 
     return akuma; 
} 


float getDist(vec3 p) {
    float d = hit(p);
    //d = length(p) - 1.;
    return d;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(.001, 0.);
    vec3 n = getDist(p) - vec3(getDist(p-e.xyy), getDist(p-e.yxy),getDist(p-e.yyx));
    
    return normalize(n);
}


float doMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i<250;i++) {
        vec3 pos = ro + rd*t;
        float dist = getDist(pos);
        t += dist;
        
        if (dist < 0.001) {break;} //found something
        if (t > 100.0) {break;} //went too far ahead, just break
    }
    
    return t;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;

	vec2 m = iMouse.xy/iResolution.xy;

    vec3 ro = vec3(0, 0, -20 );
    ro.yz *= rot2d(-m.y*3.14+1.);
    ro.xz *= rot2d(-m.x*6.28);
    
    vec3 sundir = normalize(vec3(0.1, 0.8, 0.6)); 
    vec3 sun = vec3(1.64, 1.27, 0.99); 

    //vec3 ro = vec3(0, 0, -3);
    
    vec3 forward = normalize(vec3(0.)-ro); //look up pos?
    vec3 right = normalize(cross(vec3(0,1,0), forward));
    vec3 up = cross(forward,right);
    
    vec3 rd = normalize(uv.x*right + uv.y*up+forward);
    vec3 col = vec3(0.02);
    
    float marchOut = doMarch(ro, rd);

    if (marchOut < 100.) {
        vec3 p = ro + rd * marchOut;
        vec3 n = getNormal(p);
        float shadow = softshadow(p, sundir, 10.0 );
        float diff = max(0.0, dot(n, sundir));
        float bac = max(0.3 + 0.7 * dot(vec3(-sundir.x, -1.0, -sundir.z), n), 0.0); 
        
        col = diff*shadow*sun*4.5;
        col += 0.2 * bac * sun; 
        vec3 tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 + vec3(0.0, 0.5, 1.0));
           col = col *vec3(0.9, 0.8, 0.6) *  0.2 * tc0;
    } 
    
    col=pow(clamp(col,0.0,1.0),vec3(0.55)); 
    col=mix(col, vec3(dot(col, vec3(0.33))), -0.5);
    fragColor = vec4(col, 1.0);
}